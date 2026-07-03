---
name: Ad Analytics system
description: Real ad tracking infrastructure — table, API endpoints, frontend utility, analytics page
---

## Architecture

- `ad_events` table created via raw SQL (drizzle-kit push needs TTY — use `executeSql` callback instead)
- Schema file: `lib/db/src/schema/adEvents.ts` — exported in `lib/db/src/schema/index.ts`
- After any schema lib change: run `pnpm run typecheck:libs` to rebuild declarations before artifact typechecks

## API

- `POST /api/ads/:id/view` — public, no auth, skips staff server-side (`req.session.role === "admin"|"agent"`)
- `POST /api/ads/:id/click` — same
- `GET /api/ads/:id/analytics` — requireStaff, returns full analytics computed from ad_events + settings totals
- Both endpoints: update settings counters AND insert into ad_events for detailed analytics
- All in `artifacts/api-server/src/routes/adsAnalytics.ts`, registered in routes/index.ts

## Frontend

- Tracking utility: `artifacts/alamoudi/src/lib/adTracking.ts` — detects device/browser/OS/language/referrer
- `AdsBanner.tsx`: checks `isStaff` (from `useAuth`) before tracking; sends full payload incl. clickX/clickY and viewDuration
- `DataContext.tsx`: `trackAdView`/`trackAdClick` accept optional `payload?: Record<string, unknown>` (interface updated too)

## Admin

- Analytics page: `artifacts/alamoudi/src/pages/admin/AdminAnalytics.tsx`
  - Route: `/admin/ads/:id/analytics` (lazy-loaded, Protected)
  - Has: overview cards, timeline chart, devices/browsers/OS/languages, traffic sources, screen sizes, peak hours, weekday chart, click heatmap
  - Filters: 7d / 30d / 90d / all
- `Ads.tsx` admin: BarChart2 icon button → navigates to analytics page

## What is NOT tracked (no fake data shown)

- Country/City geolocation (needs external IP geo API)
- Bounce rate (needs session-level tracking beyond ad events)
- Social shares/copies

**Why:** user explicitly said "if can't be measured, don't show it"
