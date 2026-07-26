import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// SUPABASE_DATABASE_URL takes priority so both Replit and Vercel always
// connect to the same external Supabase database.  Replit's runtime sets
// DATABASE_URL to its internal PostgreSQL and that value cannot be overridden
// via secrets, so we use a separate key and fall back to DATABASE_URL when
// SUPABASE_DATABASE_URL is absent (e.g. local dev without Supabase).
const connectionString =
  process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "No database connection string found. " +
      "Set SUPABASE_DATABASE_URL (preferred) or DATABASE_URL.",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
