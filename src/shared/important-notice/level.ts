import type { IMPORTANT_NOTICE_LEVELS } from "@/server/drizzle/schema";

export type ImportantNoticeLevel = (typeof IMPORTANT_NOTICE_LEVELS)[number];

export const IMPORTANT_NOTICE_LEVEL_LABELS = {
  INFO: "通常",
  WARNING: "警告",
} as const satisfies Record<ImportantNoticeLevel, string>;
