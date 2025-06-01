import { UploadResult } from "@/types";

export const INITIAL_STATE: UploadResult = { id: null, title: "", message: "", status: 0 };

export const QUERY_KEYS = {
  mapList: ["mapList"] as const,
  usersResultList: ["usersResultList"] as const,
};

export const PREVIEW_DISABLE_PATHNAMES = ["type", "edit"];
