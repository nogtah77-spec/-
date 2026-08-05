import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, regionsTable, insertRegionSchema } from "@workspace/db";
import { requireStaff } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

router.get("/regions", async (_req, res): Promise<void> => {
  const rows = await db.select().from(regionsTable);
  res.json(rows);
});

router.post("/regions", requireStaff, async (req, res): Promise<void> => {
  const parsed = insertRegionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(regionsTable).values(parsed.data).returning();
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
  const [row] = await db
    .update(regionsTable)
    .set(parsed.data)
    .where(eq(regionsTable.id, id))
    .returning();
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
    .select()
    .from(regionsTable)
    .where(eq(regionsTable.id, id))
    .limit(1);
  await db.delete(regionsTable).where(eq(regionsTable.id, id));
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
