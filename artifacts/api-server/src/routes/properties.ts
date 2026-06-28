import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, propertiesTable, insertPropertySchema } from "@workspace/db";
import { requireStaff } from "../lib/auth";

const router: IRouter = Router();

router.get("/properties", async (_req, res): Promise<void> => {
  const rows = await db.select().from(propertiesTable);
  res.json(rows);
});

router.post("/properties", requireStaff, async (req, res): Promise<void> => {
  const parsed = insertPropertySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(propertiesTable).values(parsed.data).returning();
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
  res.json(row);
});

router.delete("/properties/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
  res.sendStatus(204);
});

export default router;
