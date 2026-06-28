import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, finishingRequestsTable, insertFinishingRequestSchema } from "@workspace/db";
import { requireStaff } from "../lib/auth";

const router: IRouter = Router();

const statusSchema = z.object({ status: z.string() });

router.get("/finishing-requests", requireStaff, async (_req, res): Promise<void> => {
  const rows = await db.select().from(finishingRequestsTable);
  res.json(rows);
});

router.post("/finishing-requests", async (req, res): Promise<void> => {
  const parsed = insertFinishingRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(finishingRequestsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/finishing-requests/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(finishingRequestsTable)
    .set({ status: parsed.data.status })
    .where(eq(finishingRequestsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(row);
});

router.delete("/finishing-requests/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(finishingRequestsTable).where(eq(finishingRequestsTable.id, id));
  res.sendStatus(204);
});

export default router;
