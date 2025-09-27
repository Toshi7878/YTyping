import { boolean, integer, pgEnum, pgTable, primaryKey, real, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { DEFAULT_TYPING_OPTIONS, MAX_SHORT_LENGTH } from "../const";

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
  keyboard: varchar("keyboard").notNull().default(""),
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
export const timeOffsetAdjustKeyEnum = pgEnum("time_offset_key", ["CTRL_LEFT_RIGHT", "CTRL_ALT_LEFT_RIGHT", "NONE"]);
export const InputModeToggleKeyEnum = pgEnum("toggle_input_mode_key", ["ALT_KANA", "TAB", "NONE"]);
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
  timeOffset: real("time_offset").notNull().default(DEFAULT_TYPING_OPTIONS.timeOffset),
  kanaWordScroll: integer("kana_word_scroll").notNull().default(DEFAULT_TYPING_OPTIONS.kanaWordScroll),
  romaWordScroll: integer("roma_word_scroll").notNull().default(DEFAULT_TYPING_OPTIONS.romaWordScroll),
  //TODO: font_size, top_positionのテーブル名をmain / subに変更
  mainWordFontSize: integer("kana_word_font_size").notNull().default(DEFAULT_TYPING_OPTIONS.mainWordFontSize),
  subWordFontSize: integer("roma_word_font_size").notNull().default(DEFAULT_TYPING_OPTIONS.subWordFontSize),
  mainWordTopPosition: real("kana_word_top_position").notNull().default(DEFAULT_TYPING_OPTIONS.mainWordTopPosition),
  subWordTopPosition: real("roma_word_top_position").notNull().default(DEFAULT_TYPING_OPTIONS.subWordTopPosition),
  kanaWordSpacing: real("kana_word_spacing").notNull().default(DEFAULT_TYPING_OPTIONS.kanaWordSpacing),
  romaWordSpacing: real("roma_word_spacing").notNull().default(DEFAULT_TYPING_OPTIONS.romaWordSpacing),
  typeSound: boolean("type_sound").notNull().default(DEFAULT_TYPING_OPTIONS.typeSound),
  missSound: boolean("miss_sound").notNull().default(DEFAULT_TYPING_OPTIONS.missSound),
  completedTypeSound: boolean("completed_type_sound").notNull().default(DEFAULT_TYPING_OPTIONS.completedTypeSound),
  nextDisplay: nextDisplayEnum("next_display").notNull().default(DEFAULT_TYPING_OPTIONS.nextDisplay),
  lineCompletedDisplay: lineCompletedDisplayEnum("line_completed_display")
    .notNull()
    .default(DEFAULT_TYPING_OPTIONS.lineCompletedDisplay),
  timeOffsetAdjustKey: timeOffsetAdjustKeyEnum("time_offset_adjust_key")
    .notNull()
    .default(DEFAULT_TYPING_OPTIONS.timeOffsetAdjustKey),
  InputModeToggleKey: InputModeToggleKeyEnum("input_mode_toggle_key")
    .notNull()
    .default(DEFAULT_TYPING_OPTIONS.InputModeToggleKey),
  wordDisplay: mainWordDisplayEnum("main_word_display").notNull().default(DEFAULT_TYPING_OPTIONS.wordDisplay),
});

export const DEFAULT_IME_OPTIONS = {
  enableAddSymbol: false,
  enableEngUpperCase: false,
  enableEngSpace: false,
  addSymbolList: "",
  enableNextLyrics: true,
  enableLargeVideoDisplay: false,
};
export const UserImeTypingOptions = pgTable("user_ime_typing_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => Users.id, { onDelete: "cascade" }),
  enableAddSymbol: boolean("enable_add_symbol").notNull().default(DEFAULT_IME_OPTIONS.enableAddSymbol),
  enableEngSpace: boolean("enable_eng_space").notNull().default(DEFAULT_IME_OPTIONS.enableEngSpace),
  enableEngUpperCase: boolean("enable_eng_upper_case").notNull().default(DEFAULT_IME_OPTIONS.enableEngUpperCase),
  enableNextLyrics: boolean("enable_next_lyrics").notNull().default(DEFAULT_IME_OPTIONS.enableNextLyrics),
  addSymbolList: varchar("add_symbol_list", { length: MAX_SHORT_LENGTH })
    .notNull()
    .default(DEFAULT_IME_OPTIONS.addSymbolList),
  enableLargeVideoDisplay: boolean("enable_large_video_display")
    .notNull()
    .default(DEFAULT_IME_OPTIONS.enableLargeVideoDisplay),
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
