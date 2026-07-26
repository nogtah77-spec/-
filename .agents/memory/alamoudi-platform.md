---
name: Alamoudi platform
description: Arabic RTL real-estate artifact — key quirks, DB setup, and Vercel deployment details.
---

## Database: Supabase is single source of truth

Both Replit dev and Vercel production connect to the same Supabase project.

**Project ref**: `jkmviewpoghtiowowrke` | **Region**: `eu-west-1` (Ireland)

**Connection-string resolution** (in `lib/db/src/index.ts` and `lib/db/drizzle.config.ts`):
1. `buildSupabaseUrl()` — derives URL from `SUPABASE_DB_PASSWORD` + `SUPABASE_URL` (both already secrets in Replit). Transaction pooler port **6543** for the app; session pooler port **5432** for drizzle-kit.
2. `SUPABASE_DATABASE_URL` — explicit override (kept as fallback; the one the user typed in had the wrong password, so priority 1 handles Replit).
3. `DATABASE_URL` — Replit internal PostgreSQL (only if nothing above is set; effectively unused now).

**Vercel env vars needed**:
- `DATABASE_URL` = `postgresql://postgres.jkmviewpoghtiowowrke:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
- `SESSION_SECRET` (88 chars)
- `GEMINI_API_KEY`
- `BASE_PATH=/`
- Vercel Root Directory must be `/` (not `artifacts/alamoudi`)

**Supabase schema** — 15 tables created from scratch (old schema was incompatible).  
Seed data migrated: 12 regions, 16 property types, 1 admin user (`admin-root`), 785KB settings JSON.

## Search / property codes

Search must match `p.code` — seed titles differ from the code field. TikTok thumbnail proxy and video-cover priority are implemented in the frontend.

## Brand icons

SVG brand icons are embedded inline (not external URLs).
