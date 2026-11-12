import { getCloudinaryVideoThumbnail } from "./cloudinaryService";

// Extracts a clean, canonical URL from whatever the user pastes for a video:
// a plain link, a short link, OR a full TikTok "Embed" code (<blockquote>…</blockquote>).
export function extractVideoUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  const s = raw.trim();
  if (!s) return "";
  // Plain single URL → use as-is.
  if (/^https?:\/\/[^\s"'<>]+$/i.test(s)) return s;
  // TikTok embed code: prefer the cite="..." canonical URL.
  const cite = s.match(/cite=["']([^"']+)["']/i);
  if (cite && /tiktok\.com/i.test(cite[1])) return cite[1];
  // Any embedded tiktok video URL inside the HTML.
  const urlMatch = s.match(/https?:\/\/[^\s"'<>]*tiktok\.com\/[^\s"'<>]*/i);
  if (urlMatch) return urlMatch[0];
  // Fall back to building a URL from the numeric video id.
  const vid = s.match(/data-video-id=["'](\d{6,})["']/i) || s.match(/\/video\/(\d{6,})/);
  if (vid) return `https://www.tiktok.com/@_/video/${vid[1]}`;
  // Any URL at all (e.g. youtube embed code).
  const anyUrl = s.match(/https?:\/\/[^\s"'<>]+/i);
  return anyUrl ? anyUrl[0] : s;
}

export function getVideoThumbnailUrl(videoUrl: string | undefined | null): string | null {
  if (!videoUrl) return null;
  const url = extractVideoUrl(videoUrl);
  if (!url) return null;

  // Cloudinary video automated smart thumbnail
  const cloudThumb = getCloudinaryVideoThumbnail(url);
  if (cloudThumb) return cloudThumb;

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
  if (/(^|\.)tiktok\.com/i.test(url)) {
    return `/api/tiktok/thumbnail?url=${encodeURIComponent(url)}`;
  }
  return null;
}

export function isYouTubeUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)[A-Za-z0-9_-]{11}/i.test(raw);
}

/**
 * Detects whether an image loaded from YouTube is actually the generic
 * "Processing / Scheduled / Unavailable" placeholder (120x90 or uniform neutral gray with 3 dots).
 */
export function isYouTubePlaceholder(img: HTMLImageElement): boolean {
  try {
    // 1. YouTube returns a 120x90 image when video thumbnail is unavailable/scheduled
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      return true;
    }
    // 2. Pixel analysis for the 3-dots gray placeholder (flat gray ~125..135 with white dots in center)
    if (!img.naturalWidth || !img.naturalHeight) return false;
    const w = 24;
    const h = 18;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let grayCount = 0;
    const total = w * h;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      // Neutral gray: saturation (max - min) <= 10 and brightness in mid-gray range 110..155
      if (maxC - minC <= 10 && maxC >= 110 && maxC <= 155) {
        grayCount++;
      }
    }
    // If over 60% of the sampled thumbnail is flat neutral gray, it's the YouTube placeholder!
    if (grayCount / total > 0.6) {
      return true;
    }
  } catch {
    // If CORS or canvas throws, return false so normal photos aren't blocked
    return false;
  }
  return false;
}

export function hasVideo(videoUrl: string | undefined | null): boolean {
  return !!(videoUrl && videoUrl.trim());
}
