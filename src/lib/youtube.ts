/**
 * YouTube helper utilities for extracting video IDs, thumbnails, and embed URLs.
 * Ponytail protocol enabled.
 */

export function getYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export function isYouTubeShort(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes("/shorts/");
}

export function getYouTubeThumbnail(youtubeId: string, highRes = true): string {
  return highRes
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}
