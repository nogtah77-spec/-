import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db, propertiesTable, insertPropertySchema } from "@workspace/db";
import { requireStaff } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

function propertyLabel(p: { title?: string | null; code?: string | null }): string {
  return p.title?.trim() || p.code || "عقار";
}

router.get("/properties", async (_req, res): Promise<void> => {
  const rows = await db.select().from(propertiesTable);
  res.json(rows);
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
  const [row] = await db.insert(propertiesTable).values(parsed.data).returning();
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
      await db
        .update(propertiesTable)
        .set(rest)
        .where(eq(propertiesTable.id, existing[0].id));
      updated++;
    } else {
      await db.insert(propertiesTable).values(item);
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
  const [row] = await db
    .update(propertiesTable)
    .set(parsed.data)
    .where(eq(propertiesTable.id, id))
    .returning();
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
