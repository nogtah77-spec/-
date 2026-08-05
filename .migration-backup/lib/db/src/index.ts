import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Build the Supabase transaction-pooler URL from component secrets when running
// on Replit (SUPABASE_DB_PASSWORD + SUPABASE_URL are both available there).
// On Vercel the caller sets DATABASE_URL directly.  SUPABASE_DATABASE_URL is
// kept as an explicit override for any other environment.
function buildSupabaseUrl(): string | undefined {
  const pw = process.env.SUPABASE_DB_PASSWORD;
  const supaUrl = process.env.SUPABASE_URL;
  if (!pw || !supaUrl) return undefined;

  // Extract project ref from https://<ref>.supabase.co
  const ref = supaUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) return undefined;

  // Transaction pooler (port 6543) — correct for serverless / short-lived connections.
  // Region eu-west-1 is where this Supabase project lives.
  const encodedPw = encodeURIComponent(pw);
  return `postgresql://postgres.${ref}:${encodedPw}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;
}

const connectionString =
  buildSupabaseUrl() ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL;

// Do NOT throw here at module-load time.  In serverless environments (e.g.
// Vercel) the module is loaded once and any top-level throw causes every
// invocation to return FUNCTION_INVOCATION_FAILED — even healthz.  If the
// connection string is missing the error will surface clearly on the first
// query instead.
if (!connectionString) {
  console.error(
    "[db] WARNING: No database connection string found. " +
      "Set SUPABASE_DB_PASSWORD + SUPABASE_URL, SUPABASE_DATABASE_URL, or DATABASE_URL. " +
      "All database queries will fail until one of these is provided.",
  );
}

export const pool = new Pool(connectionString ? { connectionString } : {});
export const db = drizzle(pool, { schema });

export * from "./schema";
