import type { YOUTUBE_THUMBNAIL_QUALITIES } from "@/server/drizzle/schema";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";

export const getThumbnailQuality = (videoId: string) => {
  const img = new window.Image();
  img.src = getYouTubeThumbnailUrl(videoId, "maxresdefault");
  return new Promise<(typeof YOUTUBE_THUMBNAIL_QUALITIES)[number]>((resolve) => {
    img.onload = () => {
      if (img.width !== 120) {
        resolve("maxresdefault");
      } else {
        resolve("mqdefault");
      }
    };
    img.onerror = () => {
      console.error("画像の読み込みに失敗しました");
      resolve("mqdefault");
    };
  });
};
