import { UploadResult } from "@/types";

export const INITIAL_STATE: UploadResult = { id: null, title: "", message: "", status: 0 };

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
