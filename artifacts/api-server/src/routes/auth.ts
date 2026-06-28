import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { verifyPassword } from "../lib/auth";

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
  const rows = await db.select().from(usersTable);
  const user = rows.find(
    (u) =>
      u.username.toLowerCase() === identifier ||
      u.email.toLowerCase() === identifier,
  );
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
  const rows = await db.select().from(usersTable);
  const user = rows.find((u) => u.id === req.session.userId && u.active);
  if (!user) {
    res.json(null);
    return;
  }
  res.json(publicUser(user));
});

export default router;
