import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, pool, regionsTable, insertRegionSchema, settingsTable } from "@workspace/db";
import { requireStaff } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42703"
  );
}

type RegionHeroImages = Record<string, string>;

async function getRegionHeroImages(): Promise<RegionHeroImages> {
  const [row] = await db
    .select({ data: settingsTable.data })
    .from(settingsTable)
    .limit(1);
  const value = row?.data?.regionHeroImages;
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

async function setRegionHeroImage(id: string, heroImage: string | undefined): Promise<void> {
  const [row] = await db
    .select({ data: settingsTable.data })
    .from(settingsTable)
    .limit(1);
  const data = { ...(row?.data ?? {}) } as Record<string, unknown>;
  const images = { ...(await getRegionHeroImages()) };
  if (heroImage === undefined) {
    delete images[id];
  } else if (heroImage) {
    images[id] = heroImage;
  } else {
    delete images[id];
  }
  data.regionHeroImages = images;
  await db
    .insert(settingsTable)
    .values({ id: "main", data })
    .onConflictDoUpdate({ target: settingsTable.id, set: { data } });
}

router.get("/regions", async (_req, res): Promise<void> => {
  try {
    let rows: Array<{ id: string; name: string; active: boolean; heroImage: string }>;
    try {
      const result = await pool.query(
        `SELECT id, name, active, hero_image AS "heroImage" FROM regions`,
      );
      rows = result.rows;
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;
      const result = await pool.query(
        `SELECT id, name, active, ''::text AS "heroImage" FROM regions`,
      );
      rows = result.rows;
    }
    const fallbackImages = await getRegionHeroImages();
    res.json(rows.map((row) => ({
      ...row,
      heroImage: row.heroImage || fallbackImages[row.id] || "",
    })));
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "unknown")
      : "unknown";
    res.status(503).json({ error: "regions_read_failed", code });
  }
});

router.post("/regions", requireStaff, async (req, res): Promise<void> => {
  const parsed = insertRegionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { heroImage, ...legacyData } = parsed.data;
  let row;
  let usedLegacySchema = false;
  try {
    [row] = await db.insert(regionsTable).values(parsed.data).returning();
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    usedLegacySchema = true;
    const result = await pool.query(
      `INSERT INTO regions (id, name, active)
       VALUES ($1, $2, $3)
       RETURNING id, name, active`,
      [legacyData.id, legacyData.name, legacyData.active ?? true],
    );
    row = result.rows[0];
    await setRegionHeroImage(row.id, heroImage);
    row = { ...row, heroImage: heroImage ?? "" };
  }
  if (!usedLegacySchema && heroImage !== undefined) {
    // If the optional column exists again, remove any stale legacy fallback.
    await setRegionHeroImage(row.id, undefined);
  }
  await logActivity({
    action: "created",
    entityType: "region",
    title: `تمت إضافة منطقة: ${row.name}`,
    actor: actorFromReq(req),
  });
  res.status(201).json(row);
});

router.patch("/regions/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = insertRegionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { heroImage, ...legacyPatch } = parsed.data;
  let row;
  let usedLegacySchema = false;
  try {
    [row] = await db
      .update(regionsTable)
      .set(parsed.data)
      .where(eq(regionsTable.id, id))
      .returning();
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    usedLegacySchema = true;
    const updates: string[] = [];
    const values: unknown[] = [];
    if (legacyPatch.name !== undefined) {
      values.push(legacyPatch.name);
      updates.push(`name = $${values.length}`);
    }
    if (legacyPatch.active !== undefined) {
      values.push(legacyPatch.active);
      updates.push(`active = $${values.length}`);
    }
    if (updates.length > 0) {
      values.push(id);
      const result = await pool.query(
        `UPDATE regions
         SET ${updates.join(", ")}
         WHERE id = $${values.length}
         RETURNING id, name, active`,
        values,
      );
      row = result.rows[0];
    } else {
      const result = await pool.query(
        `SELECT id, name, active FROM regions WHERE id = $1 LIMIT 1`,
        [id],
      );
      row = result.rows[0];
    }
    if (row && heroImage !== undefined) {
      await setRegionHeroImage(id, heroImage);
    }
    if (row) {
      row = { ...row, heroImage: heroImage ?? (await getRegionHeroImages())[id] ?? "" };
    }
  }
  if (!usedLegacySchema && heroImage !== undefined) {
    // Keep a previous legacy fallback from resurfacing after an explicit edit.
    await setRegionHeroImage(id, undefined);
  }
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  await logActivity({
    action: "updated",
    entityType: "region",
    title: `تم تعديل منطقة: ${row.name}`,
    actor: actorFromReq(req),
  });
  res.json(row);
});

router.delete("/regions/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [existing] = await db
    .select({ id: regionsTable.id, name: regionsTable.name })
    .from(regionsTable)
    .where(eq(regionsTable.id, id))
    .limit(1);
  await db.delete(regionsTable).where(eq(regionsTable.id, id));
  await setRegionHeroImage(id, undefined);
  if (existing) {
    await logActivity({
      action: "deleted",
      entityType: "region",
      title: `تم حذف منطقة: ${existing.name}`,
      actor: actorFromReq(req),
    });
  }
  res.sendStatus(204);
});

export default router;
