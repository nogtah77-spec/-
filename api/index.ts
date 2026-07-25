/**
 * Vercel serverless entry-point for the Express API.
 *
 * Vercel invokes this module as a standard Node.js request handler —
 * no app.listen() is needed here.  All /api/* traffic is rewritten to
 * this function by vercel.json, so Express sees the original URL and
 * routes it normally through the /api router.
 *
 * Required Vercel environment variables:
 *   DATABASE_URL   — PostgreSQL connection string (same as production DB)
 *   SESSION_SECRET — Secret for signing session cookies
 *   GEMINI_API_KEY — (optional) For AI assistant features
 */
import app from "../artifacts/api-server/src/app";

export default app;
