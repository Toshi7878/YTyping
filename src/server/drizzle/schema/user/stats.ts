import { sql } from "drizzle-orm";
import { date, index, integer, pgTable, primaryKey, real, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const userDailyTypeCounts = pgTable(
  "user_daily_type_counts",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date().notNull(),
    romaTypeCount: integer("roma_type_count").default(0).notNull(),
    kanaTypeCount: integer("kana_type_count").default(0).notNull(),
    flickTypeCount: integer("flick_type_count").default(0).notNull(),
    englishTypeCount: integer("english_type_count").default(0).notNull(),
    imeTypeCount: integer("ime_type_count").default(0).notNull(),
    otherTypeCount: integer("other_type_count").default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.date], name: "user_daily_type_counts_user_id_date_pk" })],
);

export const userMapCompletionPlayCounts = pgTable(
  "user_map_completion_play_counts",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mapId: integer("map_id").notNull(),
    count: integer().default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.mapId], name: "user_map_completion_play_counts_user_id_map_id_pk" }),
  ],
);

export const userStats = pgTable(
  "user_stats",
  {
    userId: integer("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    totalRankingCount: integer("total_ranking_count").default(0).notNull(),
    totalTypingTime: real("total_typing_time").default(0).notNull(),
    romaTypeTotalCount: integer("roma_type_total_count").default(0).notNull(),
    kanaTypeTotalCount: integer("kana_type_total_count").default(0).notNull(),
    flickTypeTotalCount: integer("flick_type_total_count").default(0).notNull(),
    englishTypeTotalCount: integer("english_type_total_count").default(0).notNull(),
    spaceTypeTotalCount: integer("space_type_total_count").default(0).notNull(),
    symbolTypeTotalCount: integer("symbol_type_total_count").default(0).notNull(),
    numTypeTotalCount: integer("num_type_total_count").default(0).notNull(),
    totalPlayCount: integer("total_play_count").default(0).notNull(),
    imeTypeTotalCount: integer("ime_type_total_count").default(0).notNull(),
    maxCombo: integer("max_combo").default(0).notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    totalPp: integer("total_pp").default(0).notNull(),
  },
  (table) => [index("user_stats_total_pp_idx").using("btree", table.totalPp.asc().nullsLast())],
);
