import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, regionsTable, insertRegionSchema } from "@workspace/db";
import { requireStaff } from "../lib/auth";

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
  res.json(row);
});

router.delete("/regions/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(regionsTable).where(eq(regionsTable.id, id));
  res.sendStatus(204);
});

export default router;
