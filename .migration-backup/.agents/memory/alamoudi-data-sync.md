---
name: alamoudi Excel→DB data pipeline & sync
description: How property data flows from the source Excel into the dev/prod Postgres DBs, and the non-obvious constraints when correcting it.
---

## Source-of-truth Excel uses Arabic compound/multi-option price strings
The price column in `attached_assets/...Snapshot...xlsx` is free text with Arabic numerals, e.g.
`٣ مليون و ٦٠٠ ألف` (= 3,600,000), `٥ مليون كاش | ٥.٥ مليون ٦ شهور`, `٥٠ ألف طويل | ٥٥ ألف قصير`, `١٣ ألف / شهر`, `١٥٠٠ / يوم`.
**Rule for `parsePrice` (propertyImport.ts):** take only the FIRST option (split on `|`/newline), then SUM every `مليون` segment + every `ألف` segment in that option; fall back to first numeric run when no unit word.
**Why:** the original parser grabbed only the first numeric token, so `٣ مليون و ٦٠٠ ألف` became 3,000,000 instead of 3,600,000 (affected S59/S62/S63). beds/baths/area parsing was already correct.

## Two auto-generated seed files — keep them in sync
`pnpm --filter @workspace/alamoudi run gen:seed` runs `scripts/genSeed.ts`, which now writes BOTH:
- `artifacts/alamoudi/src/data/seedProperties.ts` (type `Property`, largely dead post-DB-migration)
- `artifacts/api-server/src/data/seedProperties.ts` (type `InsertProperty`) ← the LIVE DB seed source
Records are byte-identical except the import/type line. Never hand-edit; always re-run gen:seed.

## Seed only inserts into an EMPTY table; dev and prod are SEPARATE DBs
`api-server/src/lib/seed.ts` inserts SEED_PROPERTIES only when `properties` is empty. So editing the seed never updates rows that already exist — a redeploy will NOT re-import.
Dev and prod are independent databases and can diverge (observed: prod had a price dev lacked).
**Correcting existing data:**
- Dev: direct `UPDATE properties SET price=$1 WHERE code=$2` via executeSql (development).
- Prod: tooling is READ-ONLY for prod. Fix prod data through the app's own admin **ImportExport** page (Admin UI) which re-uploads the Excel and upserts by `code` via `POST /properties/import` (requireStaff). Safe only because no property has images yet — import sets `images: []`, so re-importing would clobber any uploaded images. Re-check `jsonb_array_length(images)` before advising a re-import.
