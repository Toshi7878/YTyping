import { UploadResult } from "@/types";

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

export const ACTIVE_USER_MAP_THUBNAIL_WIDTH = { base: 120 };
export const ACTIVE_USER_MAP_THUBNAIL_HEIGHT = {
  base: (ACTIVE_USER_MAP_THUBNAIL_WIDTH.base * 9) / 16,
};
export const QUERY_KEYS = {
  mapList: ["mapList"] as const,
  usersResultList: ["usersResultList"] as const,
};

export const PREVIEW_DISABLE_PATHNAMES = ["type", "edit"];

export const IS_IOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
export const IS_ANDROID = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
