import { defineConfig } from "drizzle-kit";
import path from "path";

// Mirror the connection-string resolution from lib/db/src/index.ts.
function buildSupabaseUrl(): string | undefined {
  const pw = process.env.SUPABASE_DB_PASSWORD;
  const supaUrl = process.env.SUPABASE_URL;
  if (!pw || !supaUrl) return undefined;
  const ref = supaUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) return undefined;
  const encodedPw = encodeURIComponent(pw);
  // Use session pooler port 5432 for drizzle-kit — it needs a persistent connection.
  return `postgresql://postgres.${ref}:${encodedPw}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;
}

const dbUrl =
  buildSupabaseUrl() ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "No database URL found. Set SUPABASE_DB_PASSWORD + SUPABASE_URL, or SUPABASE_DATABASE_URL, or DATABASE_URL.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
