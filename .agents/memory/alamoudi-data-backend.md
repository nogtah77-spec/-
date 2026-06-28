---
name: alamoudi shared data backend
description: How the alamoudi real-estate app's shared Postgres backend + session auth fit together, and the sharp edges to respect when changing them.
---

# alamoudi: shared Postgres backend + session auth

The alamoudi app was migrated from a localStorage-only store to a shared backend
(api-server + Replit built-in Postgres) so admin-managed content is shared across
all visitors/devices and survives redeploy. `useData()` / `useAuth()` consumer
interfaces were kept identical so the ~20 pages did not change.

## connect-pg-simple session table must be created manually
**Rule:** Do NOT rely on connect-pg-simple `createTableIfMissing: true`. It reads a
`table.sql` file relative to the module, which esbuild does NOT bundle → runtime
`ENOENT: dist/table.sql`, the `session` table is never created, and logins appear
to succeed (Set-Cookie is sent) but every later request is unauthenticated because
the session was never persisted.
**Why:** esbuild bundles JS only; the package's `table.sql` asset is left behind.
**How to apply:** The session table is created in api-server's startup seed
(`ensureSessionTable`) and the store is configured `createTableIfMissing: false`.
Keep both. Same trap applies to any library that ships runtime non-JS assets.

## Cookies require the HTTPS proxy
Session cookie is `secure: true; sameSite: "none"` with `app.set("trust proxy", 1)`.
**Why:** the preview/published app is served only through the Replit HTTPS proxy
(which sets `X-Forwarded-Proto: https`), and an iframe context needs SameSite=None.
**How to apply:** curl over plain `localhost:80` will NOT hold the session — curl
refuses to store `Secure` cookies over http. To test auth via curl you must send
`-H "X-Forwarded-Proto: https"` AND capture/replay the cookie manually; a normal
cookie jar over http silently drops it. In the real browser it just works.

## CSRF defense pairs with SameSite=None
Because the cookie is `SameSite=None` (required for the iframe), a same-origin guard
on the api-server rejects state-changing requests (POST/PUT/PATCH/DELETE) whose
`Origin` host != the request host. Same-origin app calls and non-browser clients
(no Origin header, e.g. curl) pass; forged cross-site requests are blocked with 403.
**Why:** SameSite=None alone leaves cookie-auth writes open to CSRF.
**How to apply:** if you ever switch the cookie to SameSite=Lax/Strict you can relax
this, but do NOT remove it while SameSite=None stays.

## Auth model
Default seeded admin is `admin` / `admin1234` (bcrypt-hashed). Overridable at first
boot via `ADMIN_USERNAME` / `ADMIN_PASSWORD` env; tell users to change it in the
admin Users page. Seed only creates it when no active admin exists.
Public endpoints: all GET reads of catalog data + POST inquiries / finishing-requests
/ property-requests (so visitors can submit). Everything else (writes, and GET of
users/inquiries/requests) requires a staff session (role admin|agent). The users
API never returns `passwordHash`.

## Client data layer contract
DataContext loads all collections on mount via `Promise.allSettled` behind a loading
gate and TOLERATES 401 on protected collections (sets them to `[]`) so anonymous
visitors render fine. Mutations are optimistic: the client generates ids/codes/
timestamps, updates local state, then fires the API call and toasts on failure.
AuthContext calls `data.reload()` after login/logout to refill protected collections.
**Why:** the original store was synchronous + optimistic and consumed by ~20 pages;
the interface had to stay identical.

## Deliberate deviation from repo codegen
This app uses drizzle-zod validation + a hand-written fetch client (`src/lib/api.ts`)
instead of the repo's OpenAPI/Orval React Query codegen.
**Why:** the synchronous optimistic DataContext cannot be expressed as React Query
hooks without changing every consumer page. Do not "fix" this by swapping to Orval
unless you intend to rewrite the data layer and all consumers.
