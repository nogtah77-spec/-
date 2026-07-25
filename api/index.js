/**
 * Vercel serverless entry point.
 *
 * Imports the pre-built Express app from the api-server esbuild bundle.
 * Using plain JavaScript here (not TypeScript) eliminates the TypeScript
 * compilation step that Vercel's @vercel/node runtime performs on .ts files
 * — which previously caused ESM/CJS interop errors (TS2834, TS2835, and
 * Express/pino-http typing failures) when Vercel resolved cross-package
 * TypeScript imports with node16 module resolution.
 *
 * The bundle at artifacts/api-server/dist/app.mjs is produced by esbuild
 * as part of the buildCommand in vercel.json, which runs:
 *   pnpm --filter @workspace/api-server run build
 * before the frontend build.  esbuild handles CJS/ESM interop, tree-shaking,
 * and bundling of all route handlers, middleware, and database code.
 *
 * Required Vercel environment variables:
 *   DATABASE_URL   — PostgreSQL connection string
 *   SESSION_SECRET — Secret for signing session cookies
 *   GEMINI_API_KEY — (optional) For AI assistant features
 *   BASE_PATH      — Set to /
 */
export { default } from "../artifacts/api-server/dist/app.mjs";
