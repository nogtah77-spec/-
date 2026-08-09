import { Router, type IRouter, type Request } from "express";
import { eq, sql, inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { db, pool, propertiesTable, insertPropertySchema } from "@workspace/db";
import { requireStaff } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

type PropertyWriteRow = {
  id: string;
  title: string;
  code: string;
  assignedStaffId?: string;
};

const propertyWriteReturning = {
  id: propertiesTable.id,
  title: propertiesTable.title,
  code: propertiesTable.code,
} as const;

const LEGACY_PROPERTY_SELECT = `
  id,
  code,
  title,
  description,
  price,
  area,
  beds,
  baths,
  floors,
  floor,
  finishing,
  view,
  type_id AS "typeId",
  region_id AS "regionId",
  category,
  status,
  featured,
  agent_type AS "agentType",
  images,
  video_url AS "videoUrl",
  external_url AS "externalUrl",
  maps_url AS "mapsUrl",
  created_at AS "createdAt",
  unit_type AS "unitType",
  sub_area AS "subArea",
  layout,
  master,
  elevator,
  floor_text AS "floorText",
  location,
  source,
  source_phones AS "sourcePhones",
  source_email AS "sourceEmail",
  source_location AS "sourceLocation",
  source_notes AS "sourceNotes",
  assigned_staff_id AS "assignedStaffId",
  views,
  cover_priority AS "coverPriority"
`;

const LEGACY_PROPERTY_SELECT_WITHOUT_STAFF = `
  id,
  code,
  title,
  description,
  price,
  area,
  beds,
  baths,
  floors,
  floor,
  finishing,
  view,
  type_id AS "typeId",
  region_id AS "regionId",
  category,
  status,
  featured,
  agent_type AS "agentType",
  images,
  video_url AS "videoUrl",
  external_url AS "externalUrl",
  maps_url AS "mapsUrl",
  created_at AS "createdAt",
  unit_type AS "unitType",
  sub_area AS "subArea",
  layout,
  master,
  elevator,
  floor_text AS "floorText",
  location,
  source,
  source_phones AS "sourcePhones",
  source_email AS "sourceEmail",
  source_location AS "sourceLocation",
  source_notes AS "sourceNotes",
  views,
  cover_priority AS "coverPriority"
`;

function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42703"
  );
}

const ASSIGNED_STAFF_MARKER = /\s*\[assigned_staff_id:([^\]\r\n]+)\]\s*$/;

function extractAssignedStaffId(notes: unknown): { notes: string; assignedStaffId: string } {
  const value = typeof notes === "string" ? notes : "";
  const match = value.match(ASSIGNED_STAFF_MARKER);
  return {
    notes: match ? value.slice(0, match.index).trimEnd() : value,
    assignedStaffId: match?.[1]?.trim() ?? "",
  };
}

function addAssignedStaffMarker(notes: unknown, assignedStaffId: unknown): string {
  const cleaned = extractAssignedStaffId(notes).notes;
  const staffId = typeof assignedStaffId === "string" ? assignedStaffId.trim() : "";
  return staffId ? `${cleaned}${cleaned ? "\n\n" : ""}[assigned_staff_id:${staffId}]` : cleaned;
}

function legacyPropertyData(
  data: Record<string, unknown>,
  existingNotes?: unknown,
): Record<string, unknown> {
  const existing = extractAssignedStaffId(existingNotes);
  const hasAssignedStaff = Object.prototype.hasOwnProperty.call(data, "assignedStaffId");
  const assignedStaffId = hasAssignedStaff
    ? data.assignedStaffId
    : existing.assignedStaffId;
  const sourceNotes = Object.prototype.hasOwnProperty.call(data, "sourceNotes")
    ? data.sourceNotes
    : existing.notes;
  const { assignedStaffId: _assignedStaffId, ...legacyData } = data;
  return {
    ...legacyData,
    sourceNotes: addAssignedStaffMarker(sourceNotes, assignedStaffId),
  };
}

async function selectLegacyProperties(activeOnly: boolean): Promise<Array<Record<string, unknown>>> {
  const where = activeOnly ? ` WHERE status = 'active'` : "";
  let result;
  try {
    result = await pool.query(`SELECT ${LEGACY_PROPERTY_SELECT} FROM properties${where}`);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    result = await pool.query(`SELECT ${LEGACY_PROPERTY_SELECT_WITHOUT_STAFF} FROM properties${where}`);
  }
  return result.rows.map((row) => ({
    ...(() => {
      const extracted = extractAssignedStaffId(row.sourceNotes);
      return { ...row, sourceNotes: extracted.notes, assignedStaffId: row.assignedStaffId ?? extracted.assignedStaffId };
    })(),
    parking: "",
    additionalFeatures: "",
  }));
}

function propertyLabel(p: { title?: string | null; code?: string | null }): string {
  return p.title?.trim() || p.code || "عقار";
}

function isStaffReq(req: Request): boolean {
  return !!(
    req.session?.userId &&
    (req.session.role === "admin" || req.session.role === "agent")
  );
}

router.get("/properties", async (req, res): Promise<void> => {
  try {
    // Read through the legacy-compatible projection. Production may still
    // have an older properties schema until its next schema migration.
    const rows = await selectLegacyProperties(!isStaffReq(req));
    if (isStaffReq(req)) {
      res.json(rows);
      return;
    }
    res.json(rows.map(({ source: _s, agentType: _a, sourcePhones: _sp, sourceEmail: _se, sourceLocation: _sl, sourceNotes: _sn, assignedStaffId: _as, ...rest }) => rest));
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "unknown")
      : "unknown";
    res.status(503).json({ error: "properties_read_failed", code });
  }
});

router.post("/properties/:id/view", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db
    .update(propertiesTable)
    .set({ views: sql`${propertiesTable.views} + 1` })
    .where(eq(propertiesTable.id, id));
  res.sendStatus(204);
});

router.post("/properties", requireStaff, async (req, res): Promise<void> => {
  const parsed = insertPropertySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let row: PropertyWriteRow | undefined;
  try {
    [row] = await db.insert(propertiesTable).values(parsed.data).returning();
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const legacyData = legacyPropertyData(parsed.data);
    [row] = await db
      .insert(propertiesTable)
      .values(legacyData as typeof parsed.data)
      .returning(propertyWriteReturning);
    if (!row) throw new Error("Property insert returned no row");
    row = { ...row, assignedStaffId: parsed.data.assignedStaffId ?? "" };
  }
  await logActivity({
    action: "created",
    entityType: "property",
    title: `تمت إضافة عقار: ${propertyLabel(row)}`,
    actor: actorFromReq(req),
  });
  res.status(201).json(row);
});

router.post("/properties/import", requireStaff, async (req, res): Promise<void> => {
  const parsed = z.array(insertPropertySchema).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let added = 0;
  let updated = 0;
  for (const item of parsed.data) {
    const existing = await db
      .select({ id: propertiesTable.id })
      .from(propertiesTable)
      .where(eq(propertiesTable.code, item.code))
      .limit(1);
    if (existing.length > 0) {
      const { id: _ignore, ...rest } = item;
      try {
        await db
          .update(propertiesTable)
          .set(rest)
          .where(eq(propertiesTable.id, existing[0].id));
      } catch (error) {
        if (!isMissingColumnError(error)) throw error;
        const [current] = await pool.query(
          `SELECT source_notes AS "sourceNotes" FROM properties WHERE id = $1`,
          [existing[0].id],
        ).then(result => result.rows);
        const legacyRest = legacyPropertyData(rest, current?.sourceNotes);
        await db
          .update(propertiesTable)
          .set(legacyRest)
          .where(eq(propertiesTable.id, existing[0].id));
      }
      updated++;
    } else {
      try {
        await db.insert(propertiesTable).values(item);
      } catch (error) {
        if (!isMissingColumnError(error)) throw error;
        const legacyItem = legacyPropertyData(item);
        await db
          .insert(propertiesTable)
          .values(legacyItem as typeof item)
          .returning(propertyWriteReturning);
      }
      added++;
    }
  }
  await logActivity({
    action: "imported",
    entityType: "property",
    title: `تم استيراد العقارات (${added} جديد، ${updated} تحديث)`,
    actor: actorFromReq(req),
  });
  res.json({ added, updated });
});

router.patch("/properties/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = insertPropertySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let row: PropertyWriteRow | undefined;
  try {
    [row] = await db
      .update(propertiesTable)
      .set(parsed.data)
      .where(eq(propertiesTable.id, id))
      .returning(propertyWriteReturning);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    const [current] = await pool.query(
      `SELECT source_notes AS "sourceNotes" FROM properties WHERE id = $1`,
      [id],
    ).then(result => result.rows);
    const legacyData = legacyPropertyData(parsed.data, current?.sourceNotes);
    [row] = await db
      .update(propertiesTable)
      .set(legacyData)
      .where(eq(propertiesTable.id, id))
      .returning(propertyWriteReturning);
    if (!row) {
      res.status(404).json({ error: "not found" });
      return;
    }
    row = { ...row, assignedStaffId: parsed.data.assignedStaffId ?? extractAssignedStaffId(current?.sourceNotes).assignedStaffId };
  }
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  await logActivity({
    action: "updated",
    entityType: "property",
    title: `تم تعديل عقار: ${propertyLabel(row)}`,
    actor: actorFromReq(req),
  });
  res.json(row);
});

router.delete("/properties/bulk", requireStaff, async (req, res): Promise<void> => {
  const parsed = z.object({ ids: z.array(z.string()).min(1) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { ids } = parsed.data;
  await db.delete(propertiesTable).where(inArray(propertiesTable.id, ids));
  await logActivity({
    action: "deleted",
    entityType: "property",
    title: `تم حذف ${ids.length} عقار دفعة واحدة`,
    actor: actorFromReq(req),
  });
  res.json({ deleted: ids.length });
});

router.patch("/properties/bulk", requireStaff, async (req, res): Promise<void> => {
  const parsed = z.object({
    ids: z.array(z.string()).min(1),
    updates: insertPropertySchema.partial(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { ids, updates } = parsed.data;
  await db.update(propertiesTable).set(updates).where(inArray(propertiesTable.id, ids));
  await logActivity({
    action: "updated",
    entityType: "property",
    title: `تم تحديث ${ids.length} عقار دفعة واحدة`,
    actor: actorFromReq(req),
  });
  res.json({ updated: ids.length });
});

router.delete("/properties/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [existing] = await db
    .select({ title: propertiesTable.title, code: propertiesTable.code })
    .from(propertiesTable)
    .where(eq(propertiesTable.id, id))
    .limit(1);
  await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
  if (existing) {
    await logActivity({
      action: "deleted",
      entityType: "property",
      title: `تم حذف عقار: ${propertyLabel(existing)}`,
      actor: actorFromReq(req),
    });
  }
  res.sendStatus(204);
});

export default router;
