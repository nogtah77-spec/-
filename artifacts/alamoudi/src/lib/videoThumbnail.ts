export function getVideoThumbnailUrl(videoUrl: string | undefined | null): string | null {
  if (!videoUrl) return null;
  const url = videoUrl.trim();
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
  if (/(^|\.)tiktok\.com/i.test(url)) {
    return `/api/tiktok/thumbnail?url=${encodeURIComponent(url)}`;
  }
  return null;
}

export function hasVideo(videoUrl: string | undefined | null): boolean {
  return !!(videoUrl && videoUrl.trim());
}
