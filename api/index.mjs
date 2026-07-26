/**
 * Vercel serverless entry — explicit ESM (.mjs).
 *
 * WHY DYNAMIC IMPORT WITH A RUNTIME PATH:
 *   dist/app.mjs is a self-contained esbuild bundle produced by the
 *   buildCommand.  If we use a static "export { default } from '…/dist/app.mjs'"
 *   Vercel's @vercel/node runs its own esbuild pass over that file, which:
 *     1. Re-bundles the already-bundled code (double-bundling).
 *     2. Shifts import.meta.url / __dirname inside the bundle to the Lambda's
 *        temp location, breaking esbuildPluginPino's __bundlerPathsOverrides
 *        that were computed against /home/runner/workspace at build time.
 *     3. Inlines the whole 2.4 MB bundle into an even larger Lambda artifact.
 *
 *   Using a RUNTIME-COMPUTED path in import() prevents esbuild from following
 *   the import statically.  The file is shipped to the Lambda as-is via
 *   vercel.json "includeFiles" and loaded directly by Node.js, so
 *   import.meta.url inside dist/app.mjs resolves to its actual Lambda path.
 *
 * Required Vercel environment variables:
 *   SUPABASE_URL        — https://<ref>.supabase.co
 *   SUPABASE_DB_PASSWORD — Supabase database password
 *   SESSION_SECRET      — Secret for signing session cookies
 *   GEMINI_API_KEY      — (optional) AI assistant features
 */

import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Runtime path — esbuild cannot statically follow this, so dist/app.mjs is
// NOT re-bundled; it is loaded from the Lambda filesystem via includeFiles.
const appMjsPath = path.resolve(
  __dirname,
  "../artifacts/api-server/dist/app.mjs",
);

let _app;
let _startupError;

try {
  const mod = await import(appMjsPath);
  _app = mod.default;
} catch (err) {
  _startupError = err;
  console.error("[api/index] startup error:", err.message, "\n", err.stack);
}

export default function handler(req, res) {
  if (_startupError) {
    // Surface the exact error so it is visible in curl / browser devtools
    // rather than Vercel's opaque FUNCTION_INVOCATION_FAILED page.
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        startup_error: _startupError.message,
        code: _startupError.code,
        type: _startupError.constructor?.name,
        stack: _startupError.stack?.split("\n").slice(0, 10),
      }),
    );
    return;
  }
  _app(req, res);
}
