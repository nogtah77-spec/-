---
name: alamoudi real-estate platform
description: Non-obvious behaviors of the alamoudi Arabic RTL real-estate artifact (search, media covers, brand icons)
---

# Alamoudi platform notes

- **Communicate in Arabic with this user.** Published at https://alamoudi-realest.replit.app — changes need a manual Deployments → Redeploy.

## Property search: title vs code
- Seeded properties have *descriptive* titles (e.g. "شقة 173م² (للبيع) - مدينة الشروق - المنطقة ١"), NOT the code (e.g. "S26"). The code lives in `property.code`.
- Editing+saving a property in the admin form sets `title = code` (PropertyForm handleSave), which is why a previously-unfindable property suddenly appears in search after an edit.
- **Rule:** any property search/filter must include `p.code` (and ideally description/location/subArea), not just title. Public Home search already matches code+title; admin Properties used to match only title/type/region — fixed to include code.

## Video covers (no lucide brand icons)
- lucide-react has NO WhatsApp or TikTok brand icons. Custom SVGs live in `src/components/icons/BrandIcons.tsx` (WhatsAppIcon, TikTokIcon). Use these everywhere instead of MessageCircle (whatsapp) / Music (tiktok).
- Video thumbnail helper: `src/lib/videoThumbnail.ts`. YouTube thumb is derived client-side from the URL; TikTok reuses the backend proxy route `GET /api/tiktok/thumbnail?url=` (artifacts/api-server/src/routes/tiktok.ts, validates tiktok host, returns image bytes). Other hosts → null → branded poster.
- Cover priority in PropertyCard & PropertyDetails: uploaded image (`images[0]`) ALWAYS wins; only when there is no image AND a videoUrl do we show the thumbnail/poster with a Play overlay. Reset the thumb-failure state on property id change (else sticky fallback across navigations in wouter).

## AI consultant ("المستشار الذكي")
- User REJECTED Replit-managed AI (phone verification broken). Backend is provider-agnostic via direct REST (no SDKs, Node24 global fetch): tries GEMINI_API_KEY → GROQ_API_KEY → OPENROUTER_API_KEY in that order. No key set = endpoints return `{code:"AI_NOT_CONFIGURED"}` gracefully; UI shows Arabic "غير مُفعّل" + retry.
- Leads: AI emits `<<<LEAD>>>{json}<<<END_LEAD>>>` marker, server parses+saves to `ai_leads` table and strips marker from reply. Admin-only page `/admin/ai-leads`.
- **Rate-limit IP gotcha:** app.ts sets `trust proxy`, so `req.ip` already resolves the real client IP. NEVER read raw `x-forwarded-for` for rate-limit keys — clients spoof it to rotate IPs and bypass the limit. (Architect caught this.)
- `ai_leads` table was created via raw SQL — drizzle `push` needs a TTY and fails in this env.
