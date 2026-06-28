import { Router, type IRouter } from "express";

const router: IRouter = Router();

const TIKTOK_URL_RE = /^https?:\/\/([a-z0-9-]+\.)?tiktok\.com\//i;
const THUMB_HOST_RE = /(^|\.)(tiktokcdn(-us)?\.com|tiktokcdn-eu\.com|ttwstatic\.com|tiktok\.com)$/i;
const MAX_BYTES = 5 * 1024 * 1024;

router.get("/tiktok/thumbnail", async (req, res) => {
  const url = typeof req.query.url === "string" ? req.query.url : "";
  if (!url || !TIKTOK_URL_RE.test(url)) {
    res.status(400).json({ error: "invalid url" });
    return;
  }
  try {
    const oembedRes = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) },
    );
    if (!oembedRes.ok) {
      res.status(502).json({ error: "oembed failed" });
      return;
    }
    const data = (await oembedRes.json()) as { thumbnail_url?: string };
    const thumb = data.thumbnail_url;
    if (!thumb) {
      res.status(404).json({ error: "no thumbnail" });
      return;
    }

    let thumbHost: string;
    try {
      const parsed = new URL(thumb);
      if (parsed.protocol !== "https:" || !THUMB_HOST_RE.test(parsed.hostname)) {
        res.status(502).json({ error: "untrusted thumbnail host" });
        return;
      }
      thumbHost = parsed.hostname;
    } catch {
      res.status(502).json({ error: "bad thumbnail url" });
      return;
    }

    const imgRes = await fetch(thumb, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.tiktok.com/" },
      signal: AbortSignal.timeout(8000),
    });
    if (!imgRes.ok) {
      res.status(502).json({ error: "image fetch failed" });
      return;
    }
    const contentType = imgRes.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      res.status(502).json({ error: "not an image" });
      return;
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      res.status(502).json({ error: "image too large" });
      return;
    }

    req.log.info({ thumbHost, bytes: buf.byteLength }, "tiktok thumbnail served");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buf.byteLength);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.end(buf);
  } catch (err) {
    req.log.error({ err }, "tiktok thumbnail proxy failed");
    res.status(502).json({ error: "proxy error" });
  }
});

export default router;
