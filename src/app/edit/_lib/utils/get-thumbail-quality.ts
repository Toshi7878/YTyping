import type { thumbnailQualityEnum } from "@/server/drizzle/schema";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";

export const getThumbnailQuality = (videoId: string) => {
  const img = new window.Image();
  img.src = buildYouTubeThumbnailUrl(videoId, "maxresdefault");
  return new Promise<(typeof thumbnailQualityEnum.enumValues)[number]>((resolve) => {
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
