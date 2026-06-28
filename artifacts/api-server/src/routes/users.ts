import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, usersTable } from "@workspace/db";
import { requireStaff, hashPassword } from "../lib/auth";

const router: IRouter = Router();

const publicColumns = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  username: usersTable.username,
  role: usersTable.role,
  active: usersTable.active,
  joinedAt: usersTable.joinedAt,
};

const userInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  role: z.string().optional(),
  active: z.boolean().optional(),
  joinedAt: z.string(),
});

const userUpdateSchema = userInputSchema.partial();

router.get("/users", requireStaff, async (_req, res): Promise<void> => {
  const rows = await db.select(publicColumns).from(usersTable);
  res.json(rows);
});

router.post("/users", requireStaff, async (req, res): Promise<void> => {
  const parsed = userInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password, ...rest } = parsed.data;
  const passwordHash = password ? await hashPassword(password) : "";
  const [row] = await db
    .insert(usersTable)
    .values({ ...rest, passwordHash })
    .returning(publicColumns);
  res.status(201).json(row);
});

router.patch("/users/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password, id: _ignore, ...rest } = parsed.data;
  const values: Record<string, unknown> = { ...rest };
  if (password) {
    values.passwordHash = await hashPassword(password);
  }
  const [row] = await db
    .update(usersTable)
    .set(values)
    .where(eq(usersTable.id, id))
    .returning(publicColumns);
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(row);
});

router.delete("/users/:id", requireStaff, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
