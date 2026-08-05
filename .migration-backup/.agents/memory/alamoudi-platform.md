---
name: Alamoudi platform
description: Arabic RTL real-estate artifact — key quirks, DB setup, and Vercel deployment details.
---

## Database: Supabase is single source of truth

Both Replit dev and Vercel production connect to the same Supabase project.

**Project ref**: `jkmviewpoghtiowowrke` | **Region**: `eu-west-1` (Ireland)

**Connection-string resolution** (`lib/db/src/index.ts` and `lib/db/drizzle.config.ts`):
1. `buildSupabaseUrl()` — derives URL from `SUPABASE_DB_PASSWORD` + `SUPABASE_URL` (both secrets in Replit AND Vercel). Transaction pooler port **6543** for the app; session pooler port **5432** for drizzle-kit.
2. `SUPABASE_DATABASE_URL` — explicit override (kept as fallback; has wrong password, so priority 1 takes over).
3. `DATABASE_URL` — Replit internal PostgreSQL (only if nothing above is set; effectively unused now).

**DO NOT throw at module load** if no connection string found — serverless functions crash before any request is handled. Log a warning instead (`lib/db/src/index.ts` uses `console.error` + falls back to empty Pool).

**Vercel env vars required**:
- `SUPABASE_URL` = `https://jkmviewpoghtiowowrke.supabase.co`
- `SUPABASE_DB_PASSWORD` = Supabase database password
- `SESSION_SECRET` = session signing secret
- `GEMINI_API_KEY` = (optional) AI features

**Supabase schema** — 15 tables, clean slate (old schema dropped). Seed: 12 regions, 16 property types, 1 admin (`admin-root`), 785KB settings JSON, 65 seeded properties.

## Vercel serverless function architecture

**Entry**: `api/index.mjs` (explicit `.mjs` — never `.js` or `.ts`).

**Critical pattern — do NOT use static import**:
```js
// WRONG — causes @vercel/node to re-bundle dist/app.mjs:
export { default } from "../artifacts/api-server/dist/app.mjs";

// CORRECT — runtime path prevents static bundling:
const appMjsPath = path.resolve(__dirname, "../artifacts/api-server/dist/app.mjs");
const mod = await import(appMjsPath);
```

**Why**: `esbuildPluginPino` hardcodes `/home/runner/workspace/artifacts/api-server/dist` into the bundle. A static import causes `@vercel/node`'s esbuild to re-bundle `dist/app.mjs`, shifting `import.meta.url`/`__dirname` to the Lambda temp location and breaking the entire module system (FUNCTION_INVOCATION_FAILED on every route).

**`vercel.json` functions config** must include:
```json
"functions": {
  "api/index.mjs": { "includeFiles": "artifacts/api-server/dist/**" }
}
```
This ships pino worker files (`pino-worker.mjs`, `thread-stream-worker.mjs`, etc.) to the Lambda filesystem so they're accessible at runtime.

**Vercel Root Directory** must be `/` (not `artifacts/alamoudi`) so `vercel.json` is picked up.

## Search / property codes

Search must match `p.code` — seed titles differ from the code field.

## Brand icons / video

SVG brand icons are embedded inline. TikTok thumbnail proxy and video-cover priority are in the frontend.
