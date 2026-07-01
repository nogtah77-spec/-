import { Router, type IRouter } from "express";
import { eq, or, and, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { verifyPassword } from "../lib/auth";
import { logActivity } from "../lib/activityLog";

const router: IRouter = Router();

function publicUser(u: {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  active: boolean;
  joinedAt: string;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    active: u.active,
    joinedAt: u.joinedAt,
  };
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const identifier = String(req.body?.identifier ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!identifier || !password) {
    res.status(400).json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور" });
    return;
  }
  const rows = await db.select().from(usersTable).where(
    or(
      sql`lower(${usersTable.username}) = ${identifier}`,
      sql`lower(${usersTable.email}) = ${identifier}`,
    ),
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    return;
  }
  if (!user.active) {
    res.status(403).json({ error: "هذا الحساب غير مفعّل. تواصل مع الإدارة." });
    return;
  }
  if (user.role !== "admin" && user.role !== "agent") {
    res.status(403).json({ error: "هذه الصفحة مخصّصة للإدارة والموظفين فقط" });
    return;
  }
  req.session.userId = user.id;
  req.session.role = user.role;
  void logActivity({
    action: "login",
    entityType: "auth",
    title: `تسجيل الدخول إلى لوحة التحكم: ${user.name}`,
    actor: user.role === "agent" ? "موظف" : "الإدارة",
  });
  res.json(publicUser(user));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.json(null);
    return;
  }
  const rows = await db.select().from(usersTable).where(
    and(
      eq(usersTable.id, req.session.userId as string),
      eq(usersTable.active, true),
    ),
  );
  const user = rows[0];
  if (!user) {
    res.json(null);
    return;
  }
  res.json(publicUser(user));
});

export default router;
