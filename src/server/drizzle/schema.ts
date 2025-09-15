import { relations, sql } from "drizzle-orm";
// prettier-ignore
import { boolean, char, check, doublePrecision, foreignKey, integer, pgEnum, pgTable, primaryKey, real, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { DEFAULT_TYPING_OPTIONS } from "./const";

// ===== Enums =====
export const thumbnailQualityEnum = pgEnum("thumbnail_quality", ["mqdefault", "maxresdefault"]);

export const categoryEnum = pgEnum("category", ["CSS", "SPEED_SHIFT"]);

export const actionEnum = pgEnum("action", ["LIKE", "OVER_TAKE"]);

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);

export const customUserActiveStateEnum = pgEnum("custom_user_active_state", ["ONLINE", "ASK_ME", "HIDE_ONLINE"]);

export const morphConvertKanaDicTypeEnum = pgEnum("morph_convert_kana_dic_type", ["DICTIONARY", "REGEX"]);

// ===== Tables =====
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").unique(),
  emailHash: varchar("email_hash").unique().notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const maps = pgTable("maps", {
  id: serial("id").primaryKey(),
  videoId: char("video_id", { length: 11 }).notNull(),
  title: varchar("title").notNull().default(""),
  artistName: varchar("artist_name").notNull().default(""),
  musicSource: varchar("music_source").notNull().default(""),
  creatorComment: varchar("creator_comment").notNull().default(""),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  previewTime: real("preview_time").notNull().default(0),
  playCount: integer("play_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  rankingCount: integer("ranking_count").notNull().default(0),
  category: categoryEnum("category")
    .array()
    .notNull()
    .default(sql`ARRAY[]::category[]`),
  thumbnailQuality: thumbnailQualityEnum("thumbnail_quality").notNull().default("mqdefault"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const mapDifficulties = pgTable("map_difficulties", {
  mapId: integer("map_id")
    .primaryKey()
    .references(() => maps.id, { onDelete: "cascade" }),
  romaKpmMedian: integer("roma_kpm_median").notNull().default(0),
  romaKpmMax: integer("roma_kpm_max").notNull().default(0),
  kanaKpmMedian: integer("kana_kpm_median").notNull().default(0),
  kanaKpmMax: integer("kana_kpm_max").notNull().default(0),
  totalTime: doublePrecision("total_time").notNull().default(0),
  romaTotalNotes: integer("roma_total_notes").notNull().default(0),
  kanaTotalNotes: integer("kana_total_notes").notNull().default(0),
  englishTotalNotes: integer("english_total_notes").notNull().default(0),
  symbolTotalNotes: integer("symbol_total_notes").notNull().default(0),
  intTotalNotes: integer("int_total_notes").notNull().default(0),
});

export const mapLikes = pgTable(
  "map_likes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    isLiked: boolean("is_liked").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mapId] })],
);

export const results = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    clapCount: integer("clap_count").notNull().default(0),
    rank: integer("rank").notNull().default(1),
  },
  (t) => [unique("uq_user_id_map_id").on(t.userId, t.mapId)],
);

export const imeResults = pgTable("ime_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mapId: integer("map_id")
    .notNull()
    .references(() => maps.id, { onDelete: "cascade" }),
  typeCount: integer("type_count").notNull().default(0),
  score: integer("score").notNull().default(0),
});

export const resultStatuses = pgTable(
  "result_statuses",
  {
    resultId: integer("result_id")
      .primaryKey()
      .references(() => results.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    defaultSpeed: real("default_speed").notNull().default(1),
    kpm: integer("kpm").notNull().default(0),
    rkpm: integer("rkpm").notNull().default(0),
    romaKpm: integer("roma_kpm").notNull().default(0),
    romaRkpm: integer("roma_rkpm").notNull().default(0),
    romaType: integer("roma_type").notNull().default(0),
    kanaType: integer("kana_type").notNull().default(0),
    flickType: integer("flick_type").notNull().default(0),
    englishType: integer("english_type").notNull().default(0),
    spaceType: integer("space_type").notNull().default(0),
    symbolType: integer("symbol_type").notNull().default(0),
    numType: integer("num_type").notNull().default(0),
    miss: integer("miss").notNull().default(0),
    lost: integer("lost").notNull().default(0),
    maxCombo: integer("max_combo").notNull().default(0),
    clearRate: real("clear_rate").notNull().default(0),
  },
  (t) => [check("default_speed_check", sql`${t.defaultSpeed} IN (0.25, 0.5, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00)`)],
);

export const resultClaps = pgTable(
  "result_claps",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resultId: integer("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    isClaped: boolean("is_claped").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.resultId] })],
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    visitorId: integer("visitor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    visitedId: integer("visited_id").notNull(),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    action: actionEnum("action").notNull().default("OVER_TAKE"),
    oldRank: integer("old_rank"),
    checked: boolean("checked").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    foreignKey({
      columns: [t.visitorId, t.mapId],
      foreignColumns: [results.userId, results.mapId],
      name: "notifications_visitor_result_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [t.visitedId, t.mapId],
      foreignColumns: [results.userId, results.mapId],
      name: "notifications_visited_result_fk",
    }).onDelete("cascade"),
    unique().on(t.visitorId, t.visitedId, t.mapId, t.action),
  ],
);

export const userProfiles = pgTable("user_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fingerChartUrl: text("finger_chart_url").notNull().default(""),
  myKeyboard: text("my_keyboard").notNull().default(""),
});

export const userOptions = pgTable("user_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  mapLikeNotify: boolean("map_like_notify").notNull().default(true),
  overTakeNotify: integer("over_take_notify").notNull().default(5),
  customUserActiveState: customUserActiveStateEnum("custom_user_active_state").notNull().default("ONLINE"),
  hideUserStats: boolean("hide_user_stats").notNull().default(false),
});

export const nextDisplayEnum = pgEnum("next_display", ["LYRICS", "WORD"]);
export const lineCompletedDisplayEnum = pgEnum("line_completed_display", ["HIGH_LIGHT", "NEXT_WORD"]);
export const timeOffsetKeyEnum = pgEnum("time_offset_key", ["CTRL_LEFT_RIGHT", "CTRL_ALT_LEFT_RIGHT", "NONE"]);
export const toggleInputModeKeyEnum = pgEnum("toggle_input_mode_key", ["ALT_KANA", "TAB", "NONE"]);
export const mainWordDisplayEnum = pgEnum("main_word_display", [
  "KANA_ROMA_UPPERCASE",
  "KANA_ROMA_LOWERCASE",
  "ROMA_KANA_UPPERCASE",
  "ROMA_KANA_LOWERCASE",
  "KANA_ONLY",
  "ROMA_UPPERCASE_ONLY",
  "ROMA_LOWERCASE_ONLY",
]);

export const userTypingOptions = pgTable("user_typing_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  timeOffset: doublePrecision("time_offset").notNull().default(DEFAULT_TYPING_OPTIONS.time_offset),
  kanaWordScroll: integer("kana_word_scroll").notNull().default(DEFAULT_TYPING_OPTIONS.kana_word_scroll),
  romaWordScroll: integer("roma_word_scroll").notNull().default(DEFAULT_TYPING_OPTIONS.roma_word_scroll),
  kanaWordFontSize: integer("kana_word_font_size").notNull().default(DEFAULT_TYPING_OPTIONS.kana_word_font_size),
  romaWordFontSize: integer("roma_word_font_size").notNull().default(DEFAULT_TYPING_OPTIONS.roma_word_font_size),
  kanaWordTopPosition: doublePrecision("kana_word_top_position")
    .notNull()
    .default(DEFAULT_TYPING_OPTIONS.kana_word_top_position),
  romaWordTopPosition: doublePrecision("roma_word_top_position")
    .notNull()
    .default(DEFAULT_TYPING_OPTIONS.roma_word_top_position),
  kanaWordSpacing: doublePrecision("kana_word_spacing").notNull().default(DEFAULT_TYPING_OPTIONS.kana_word_spacing),
  romaWordSpacing: doublePrecision("roma_word_spacing").notNull().default(DEFAULT_TYPING_OPTIONS.roma_word_spacing),
  typeSound: boolean("type_sound").notNull().default(DEFAULT_TYPING_OPTIONS.type_sound),
  missSound: boolean("miss_sound").notNull().default(DEFAULT_TYPING_OPTIONS.miss_sound),
  lineClearSound: boolean("line_clear_sound").notNull().default(DEFAULT_TYPING_OPTIONS.line_clear_sound),
  nextDisplay: nextDisplayEnum("next_display").notNull().default(DEFAULT_TYPING_OPTIONS.next_display),
  lineCompletedDisplay: lineCompletedDisplayEnum("line_completed_display")
    .notNull()
    .default(DEFAULT_TYPING_OPTIONS.line_completed_display),
  timeOffsetKey: timeOffsetKeyEnum("time_offset_key").notNull().default(DEFAULT_TYPING_OPTIONS.time_offset_key),
  toggleInputModeKey: toggleInputModeKeyEnum("toggle_input_mode_key")
    .notNull()
    .default(DEFAULT_TYPING_OPTIONS.toggle_input_mode_key),
  mainWordDisplay: mainWordDisplayEnum("main_word_display").notNull().default(DEFAULT_TYPING_OPTIONS.main_word_display),
});

export const userImeTypingOptions = pgTable("user_ime_typing_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  enableAddSymbol: boolean("enable_add_symbol").notNull().default(false),
  enableEngSpace: boolean("enable_eng_space").notNull().default(false),
  enableEngUpperCase: boolean("enable_eng_upper_case").notNull().default(false),
  enableNextLyrics: boolean("enable_next_lyrics").notNull().default(true),
  addSymbolList: text("add_symbol_list").notNull().default(""),
  enableLargeVideoDisplay: boolean("enable_large_video_display").notNull().default(false),
});

export const userStats = pgTable("user_stats", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totalRankingCount: integer("total_ranking_count").notNull().default(0),
  totalTypingTime: doublePrecision("total_typing_time").notNull().default(0),
  romaTypeTotalCount: integer("roma_type_total_count").notNull().default(0),
  kanaTypeTotalCount: integer("kana_type_total_count").notNull().default(0),
  flickTypeTotalCount: integer("flick_type_total_count").notNull().default(0),
  englishTypeTotalCount: integer("english_type_total_count").notNull().default(0),
  spaceTypeTotalCount: integer("space_type_total_count").notNull().default(0),
  symbolTypeTotalCount: integer("symbol_type_total_count").notNull().default(0),
  numTypeTotalCount: integer("num_type_total_count").notNull().default(0),
  totalPlayCount: integer("total_play_count").notNull().default(0),
  imeTypeTotalCount: integer("ime_type_total_count").notNull().default(0),
  maxCombo: integer("max_combo").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const userDailyTypeCounts = pgTable(
  "user_daily_type_counts",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    romaTypeCount: integer("roma_type_count").notNull().default(0),
    kanaTypeCount: integer("kana_type_count").notNull().default(0),
    flickTypeCount: integer("flick_type_count").notNull().default(0),
    englishTypeCount: integer("english_type_count").notNull().default(0),
    imeTypeCount: integer("ime_type_count").notNull().default(0),
    otherTypeCount: integer("other_type_count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.createdAt] })],
);

export const morphConvertKanaDic = pgTable("morph_convert_kana_dic", {
  surface: varchar("surface").primaryKey(),
  reading: varchar("reading").notNull(),
  type: morphConvertKanaDicTypeEnum("type").notNull().default("DICTIONARY"),
});

export const fixWordEditLogs = pgTable("fix_word_edit_logs", {
  lyrics: varchar("lyrics").primaryKey(),
  word: varchar("word").notNull(),
});

// ===== Relations =====
export const usersRelations = relations(users, ({ many, one }) => ({
  maps: many(maps, { relationName: "maps_creator" }),
  results: many(results),
  resultClaps: many(resultClaps),
  mapLikes: many(mapLikes),
  notificationsAsVisitor: many(notifications, { relationName: "visitor" }),
  typingOption: one(userTypingOptions, {
    fields: [users.id],
    references: [userTypingOptions.userId],
  }),
  typingStats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId],
  }),
  userOption: one(userOptions, {
    fields: [users.id],
    references: [userOptions.userId],
  }),
  userProfile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  userDailyTypeCounts: many(userDailyTypeCounts),
  userImeTypingOptions: one(userImeTypingOptions, {
    fields: [users.id],
    references: [userImeTypingOptions.userId],
  }),
  imeResults: many(imeResults),
}));

export const mapsRelations = relations(maps, ({ one, many }) => ({
  creator: one(users, {
    fields: [maps.creatorId],
    references: [users.id],
    relationName: "maps_creator",
  }),
  results: many(results),
  mapLikes: many(mapLikes),
  notifications: many(notifications),
  difficulty: one(mapDifficulties, {
    fields: [maps.id],
    references: [mapDifficulties.mapId],
  }),
  imeResults: many(imeResults),
}));

export const mapDifficultiesRelations = relations(mapDifficulties, ({ one }) => ({
  map: one(maps, {
    fields: [mapDifficulties.mapId],
    references: [maps.id],
  }),
}));

export const mapLikesRelations = relations(mapLikes, ({ one }) => ({
  user: one(users, {
    fields: [mapLikes.userId],
    references: [users.id],
  }),
  map: one(maps, {
    fields: [mapLikes.mapId],
    references: [maps.id],
  }),
}));

export const resultsRelations = relations(results, ({ one, many }) => ({
  user: one(users, { fields: [results.userId], references: [users.id] }),
  map: one(maps, { fields: [results.mapId], references: [maps.id] }),
  status: one(resultStatuses, {
    fields: [results.id],
    references: [resultStatuses.resultId],
  }),
  claps: many(resultClaps),
  notificationsAsVisitor: many(notifications, { relationName: "VisitorResult" }),
  notificationsAsVisited: many(notifications, { relationName: "VisitedResult" }),
}));

export const imeResultsRelations = relations(imeResults, ({ one }) => ({
  user: one(users, { fields: [imeResults.userId], references: [users.id] }),
  map: one(maps, { fields: [imeResults.mapId], references: [maps.id] }),
}));

export const resultStatusesRelations = relations(resultStatuses, ({ one }) => ({
  result: one(results, {
    fields: [resultStatuses.resultId],
    references: [results.id],
  }),
}));

export const resultClapsRelations = relations(resultClaps, ({ one }) => ({
  user: one(users, { fields: [resultClaps.userId], references: [users.id] }),
  result: one(results, { fields: [resultClaps.resultId], references: [results.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  visitor: one(users, {
    fields: [notifications.visitorId],
    references: [users.id],
    relationName: "visitor",
  }),
  map: one(maps, { fields: [notifications.mapId], references: [maps.id] }),
  visitorResult: one(results, {
    fields: [notifications.visitorId, notifications.mapId],
    references: [results.userId, results.mapId],
    relationName: "VisitorResult",
  }),
  visitedResult: one(results, {
    fields: [notifications.visitedId, notifications.mapId],
    references: [results.userId, results.mapId],
    relationName: "VisitedResult",
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const userOptionsRelations = relations(userOptions, ({ one }) => ({
  user: one(users, { fields: [userOptions.userId], references: [users.id] }),
}));

export const userTypingOptionsRelations = relations(userTypingOptions, ({ one }) => ({
  user: one(users, {
    fields: [userTypingOptions.userId],
    references: [users.id],
  }),
}));

export const userImeTypingOptionsRelations = relations(userImeTypingOptions, ({ one }) => ({
  user: one(users, {
    fields: [userImeTypingOptions.userId],
    references: [users.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, { fields: [userStats.userId], references: [users.id] }),
}));

export const userDailyTypeCountsRelations = relations(userDailyTypeCounts, ({ one }) => ({
  user: one(users, {
    fields: [userDailyTypeCounts.userId],
    references: [users.id],
  }),
}));
