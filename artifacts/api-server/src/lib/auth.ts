import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";
import type { RequestHandler } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: string;
    userName?: string;
  }
}

const PgSession = connectPgSimple(session);

export const sessionMiddleware: RequestHandler = session({
  store: new PgSession({
    pool,
    createTableIfMissing: false,
    tableName: "session",
  }),
  secret: process.env.SESSION_SECRET || "alamoudi-dev-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(pw, hash);
  } catch {
    return false;
  }
}

export const requireStaff: RequestHandler = (req, res, next) => {
  if (
    req.session?.userId &&
    (req.session.role === "admin" || req.session.role === "agent")
  ) {
    next();
    return;
  }
  res.status(401).json({ error: "unauthorized" });
};
