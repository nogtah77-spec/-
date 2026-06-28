import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, propertyTypesTable, insertPropertyTypeSchema } from "@workspace/db";
import { requireStaff } from "../lib/auth";

const router: IRouter = Router();

router.get("/property-types", async (_req, res): Promise<void> => {
  const rows = await db.select().from(propertyTypesTable);
  res.json(rows);
});

router.post("/property-types", requireStaff, async (req, res): Promise<void> => {
  const parsed = insertPropertyTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(propertyTypesTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/property-types/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = insertPropertyTypeSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(propertyTypesTable)
    .set(parsed.data)
    .where(eq(propertyTypesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(row);
});

router.delete("/property-types/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(propertyTypesTable).where(eq(propertyTypesTable.id, id));
  res.sendStatus(204);
});

export default router;
