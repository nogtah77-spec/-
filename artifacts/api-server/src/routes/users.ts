import { Router, type IRouter } from "express";
import { eq, or, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod/v4";
import { db, usersTable } from "@workspace/db";
import { requireStaff, requireAdmin, hashPassword } from "../lib/auth";
import { logActivity, actorFromReq } from "../lib/activityLog";

const router: IRouter = Router();

const publicColumns = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  username: usersTable.username,
  role: usersTable.role,
  active: usersTable.active,
  canClearActivityLogs: usersTable.canClearActivityLogs,
  joinedAt: usersTable.joinedAt,
};

const userCreateSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب"),
  email: z.string().trim().min(1, "البريد الإلكتروني مطلوب"),
  username: z.string().trim().optional(),
  password: z.string().optional(),
  role: z.enum(["admin", "agent", "customer"]).default("customer"),
  active: z.boolean().default(true),
  canClearActivityLogs: z.boolean().default(false),
});

const userUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  username: z.string().trim().optional(),
  password: z.string().optional(),
  role: z.enum(["admin", "agent", "customer"]).optional(),
  active: z.boolean().optional(),
  canClearActivityLogs: z.boolean().optional(),
});

// Viewing the user list is staff-level (admin + agent).
router.get("/users", requireStaff, async (_req, res): Promise<void> => {
  const rows = await db.select(publicColumns).from(usersTable);
  res.json(rows);
});

// Creating, editing, and deleting users — including assigning roles — is
// admin-only. Agents must not be able to escalate privileges or manage accounts.
router.post("/users", requireAdmin, async (req, res): Promise<void> => {
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const {
    name,
    email,
    username: rawUsername,
    password,
    role,
    active,
    canClearActivityLogs,
  } = parsed.data;
  const username = rawUsername ?? "";
  if ((role === "admin" || role === "agent") && (!username || !password)) {
    res.status(400).json({ error: "كلمة المرور مطلوبة لإنشاء الحساب" });
    return;
  }

  const duplicateConditions = [sql`lower(${usersTable.email}) = ${email.toLowerCase()}`];
  if (username) duplicateConditions.push(sql`lower(${usersTable.username}) = ${username.toLowerCase()}`);
  const [duplicate] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(or(...duplicateConditions))
    .limit(1);
  if (duplicate) {
    res.status(409).json({ error: "البريد الإلكتروني أو اسم المستخدم مستخدم من قبل" });
    return;
  }

  const passwordHash = password ? await hashPassword(password) : "";
  const [row] = await db
    .insert(usersTable)
    .values({
      id: randomUUID(),
      name,
      email,
      username,
      passwordHash,
      role,
      active,
      canClearActivityLogs: role === "agent" ? canClearActivityLogs : false,
      joinedAt: new Date().toISOString(),
    })
    .returning(publicColumns);
  await logActivity({
    action: "created",
    entityType: "user",
    title: `تمت إضافة مستخدم جديد: ${row.name}`,
    actor: actorFromReq(req),
  });
  res.status(201).json(row);
});

router.patch("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password, ...rest } = parsed.data;
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
  await logActivity({
    action: "updated",
    entityType: "user",
    title: `تم تعديل بيانات مستخدم: ${row.name}`,
    actor: actorFromReq(req),
  });
  res.json(row);
});

router.delete("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const [existing] = await db
    .select(publicColumns)
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  if (existing) {
    await logActivity({
      action: "deleted",
      entityType: "user",
      title: `تم حذف مستخدم: ${existing.name}`,
      actor: actorFromReq(req),
    });
  }
  res.sendStatus(204);
});

export default router;
