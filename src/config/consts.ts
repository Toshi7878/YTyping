import { UploadResult } from "@/types";

export const DEFAULT_VOLUME = 30;

export const INITIAL_STATE: UploadResult = { id: null, title: "", message: "", status: 0 };

export const PREVIEW_YOUTUBE_WIDTH = { base: 288, xl: 448 };
export const PREVIEW_YOUTUBE_POSITION = { base: 2, lg: 5 };
export const PREVIEW_YOUTUBE_HEIGHT = {
  base: (PREVIEW_YOUTUBE_WIDTH.base * 9) / 16,
  xl: (PREVIEW_YOUTUBE_WIDTH.xl * 9) / 16,
};

export const NOTIFICATION_MAP_THUBNAIL_WIDTH = { base: 140 };
export const NOTIFICATION_MAP_THUBNAIL_HEIGHT = {
  base: (NOTIFICATION_MAP_THUBNAIL_WIDTH.base * 9) / 15,
};

export const QUERY_KEYS = {
  mapList: ["mapList"] as const,
  usersResultList: ["usersResultList"] as const,
  mapData: (mapId: string | string[]) => ["mapData", mapId] as const,
  mapRanking: (mapId: string | string[]) => ["mapRanking", mapId] as const,
  userPlayData: (resultId: string | string[]) => ["userPlayData", resultId] as const,
  mapCreatedCheck: (videoId: string) => ["createdCheck", videoId] as const,
  notification: ["notification"] as const,
};

export const PREVIEW_DISABLE_PATHNAMES = ["type", "edit"];
