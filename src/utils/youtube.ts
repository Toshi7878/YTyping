export function extractYouTubeId(url: string) {
  // 通常の watch?v=xxx
  const match = url.match(/[?&]v=([^?&]+)/)?.[1];
  if (match?.length === 11) {
    return match;
  }

  // 短縮 URL (youtu.be/xxx)
  const shortUrlMatch = url.match(/youtu\.be\/([^?&]+)/)?.[1];
  if (shortUrlMatch?.length === 11) {
    return shortUrlMatch;
  }

  // Shorts URL (youtube.com/shorts/xxx)
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/)?.[1];
  if (shortsMatch?.length === 11) {
    return shortsMatch;
  }

  return;
}

export const getYouTubeThumbnailUrl = (videoId: string, quality: "mqdefault" | "maxresdefault") => {
  switch (quality) {
    case "mqdefault":
      return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    case "maxresdefault":
      return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
  }
};
