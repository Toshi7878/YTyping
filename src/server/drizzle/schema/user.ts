import { boolean, integer, pgEnum, pgTable, primaryKey, real, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { DEFAULT_TYPING_OPTIONS } from "../const";

export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").unique(),
  emailHash: varchar("email_hash").unique().notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const UserProfiles = pgTable("user_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => Users.id, { onDelete: "cascade" }),
  fingerChartUrl: varchar("finger_chart_url").notNull().default(""),
  myKeyboard: varchar("my_keyboard").notNull().default(""),
});

export const customUserActiveStateEnum = pgEnum("custom_user_active_state", ["ONLINE", "ASK_ME", "HIDE_ONLINE"]);
export const UserOptions = pgTable("user_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => Users.id, { onDelete: "cascade" }),
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

export const UserTypingOptions = pgTable("user_typing_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => Users.id, { onDelete: "cascade" }),
  timeOffset: real("time_offset").notNull().default(DEFAULT_TYPING_OPTIONS.time_offset),
  kanaWordScroll: integer("kana_word_scroll").notNull().default(DEFAULT_TYPING_OPTIONS.kana_word_scroll),
  romaWordScroll: integer("roma_word_scroll").notNull().default(DEFAULT_TYPING_OPTIONS.roma_word_scroll),
  kanaWordFontSize: integer("kana_word_font_size").notNull().default(DEFAULT_TYPING_OPTIONS.kana_word_font_size),
  romaWordFontSize: integer("roma_word_font_size").notNull().default(DEFAULT_TYPING_OPTIONS.roma_word_font_size),
  kanaWordTopPosition: real("kana_word_top_position").notNull().default(DEFAULT_TYPING_OPTIONS.kana_word_top_position),
  romaWordTopPosition: real("roma_word_top_position").notNull().default(DEFAULT_TYPING_OPTIONS.roma_word_top_position),
  kanaWordSpacing: real("kana_word_spacing").notNull().default(DEFAULT_TYPING_OPTIONS.kana_word_spacing),
  romaWordSpacing: real("roma_word_spacing").notNull().default(DEFAULT_TYPING_OPTIONS.roma_word_spacing),
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

export const UserImeTypingOptions = pgTable("user_ime_typing_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => Users.id, { onDelete: "cascade" }),
  enableAddSymbol: boolean("enable_add_symbol").notNull().default(false),
  enableEngSpace: boolean("enable_eng_space").notNull().default(false),
  enableEngUpperCase: boolean("enable_eng_upper_case").notNull().default(false),
  enableNextLyrics: boolean("enable_next_lyrics").notNull().default(true),
  addSymbolList: varchar("add_symbol_list").notNull().default(""),
  enableLargeVideoDisplay: boolean("enable_large_video_display").notNull().default(false),
});

export const UserStats = pgTable("user_stats", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => Users.id, { onDelete: "cascade" }),
  totalRankingCount: integer("total_ranking_count").notNull().default(0),
  totalTypingTime: real("total_typing_time").notNull().default(0),
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

export const UserDailyTypeCounts = pgTable(
  "user_daily_type_counts",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
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
