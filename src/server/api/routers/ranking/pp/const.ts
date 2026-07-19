import type { PgColumn } from "drizzle-orm/pg-core";
import { userStats } from "@/server/drizzle/schema";
import type { PpMode } from "@/shared/result/pp/mode";

export const PAGE_SIZE = 30;

export const PP_MODE_COLUMNS = {
  total: userStats.totalPp,
  roma: userStats.romaPp,
  kana: userStats.kanaPp,
  flick: userStats.flickPp,
  english: userStats.englishPp,
} satisfies Record<PpMode, PgColumn>;
