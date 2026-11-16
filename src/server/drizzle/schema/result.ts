import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { maps } from "./map";
import { reportStatus, users } from "./user/user";

// 記録に登録するプレイ動画のプラットフォーム。追加するときは src/utils/play-video.ts の定義も追加する
export const VIDEO_PLATFORM_TYPES = ["YOUTUBE", "TIKTOK"] as const;
export const videoPlatform = pgEnum("video_platform", VIDEO_PLATFORM_TYPES);

export const results = pgTable.withRLS(
  "results",
  {
    id: integer().primaryKey(),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
    clapCount: integer("clap_count").default(0).notNull(),
    // 無効な記録(invalidatedAt あり)は順位を持たないため null
    rank: integer().default(1),
    // 運営が無効な記録としてマークした日時。null なら有効
    invalidatedAt: timestamp("invalidated_at"),
    invalidatedBy: integer("invalidated_by").references(() => users.id, { onDelete: "set null" }),
    // 記録に登録したプレイ動画。プラットフォームと動画IDは両方設定されるか、両方 null。
    // 動画IDの形式: YouTube は動画ID、TikTok は "ユーザー名/動画ID"
    playVideoPlatform: videoPlatform("play_video_platform"),
    playVideoId: text("play_video_id"),
  },
  (table) => [
    uniqueIndex("uq_results_user_id_map_id").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.mapId.asc().nullsLast(),
    ),
    check("play_video_platform_and_id_both_or_none", sql`(play_video_platform IS NULL) = (play_video_id IS NULL)`),
  ],
);

export const resultClaps = pgTable.withRLS(
  "result_claps",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resultId: integer("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    hasClapped: boolean("has_clapped").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.resultId], name: "result_claps_user_id_result_id_pk" })],
);

export const resultStatuses = pgTable.withRLS(
  "result_statuses",
  {
    resultId: integer("result_id")
      .primaryKey()
      .references(() => results.id, { onDelete: "cascade" }),
    score: integer().default(0).notNull(),
    minPlaySpeed: real("min_play_speed").default(1).notNull(),
    kpm: integer().default(0).notNull(),
    rkpm: integer().default(0).notNull(),
    kanaToRomaKpm: integer("kana_to_roma_kpm").default(0).notNull(),
    kanaToRomaRkpm: integer("kana_to_roma_rkpm").default(0).notNull(),
    romaType: integer("roma_type").default(0).notNull(),
    kanaType: integer("kana_type").default(0).notNull(),
    flickType: integer("flick_type").default(0).notNull(),
    englishType: integer("english_type").default(0).notNull(),
    spaceType: integer("space_type").default(0).notNull(),
    symbolType: integer("symbol_type").default(0).notNull(),
    numType: integer("num_type").default(0).notNull(),
    miss: integer().default(0).notNull(),
    lost: integer().default(0).notNull(),
    maxCombo: integer("max_combo").default(0).notNull(),
    clearRate: real("clear_rate").default(0).notNull(),
    isCaseSensitive: boolean("is_case_sensitive").default(false).notNull(),
    starRatingSnapshot: real("star_rating_snapshot").default(0).notNull(),
    pp: real().default(0).notNull(),
  },
  () => [
    check(
      "valid_play_speed_values",
      sql`(min_play_speed = ANY (ARRAY[(0.25)::real, (0.5)::real, (0.75)::real, (1.00)::real, (1.25)::real, (1.50)::real, (1.75)::real, (2.00)::real]))`,
    ),
  ],
);

export const imeResults = pgTable.withRLS("ime_results", {
  id: integer().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mapId: integer("map_id")
    .notNull()
    .references(() => maps.id, { onDelete: "cascade" }),
  typeCount: integer("type_count").default(0).notNull(),
  score: integer().default(0).notNull(),
});

export const resultReports = pgTable.withRLS(
  "result_reports",
  {
    id: serial().primaryKey(),
    reporterId: integer("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resultId: integer("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    reasonDetail: varchar("reason_detail", { length: 500 }).notNull(),
    // RESOLVED: 記録を無効化(BAN)した / DISMISSED: 対処不要
    status: reportStatus().default("PENDING").notNull(),
    adminNote: text("admin_note"),
    resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [index("idx_result_reports_result_id").using("btree", table.resultId.asc().nullsLast())],
);
