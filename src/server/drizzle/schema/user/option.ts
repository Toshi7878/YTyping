import { boolean, integer, pgEnum, pgTable, real, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const PRESENCE_STATE_TYPES = ["ONLINE", "ASK_ME", "HIDE_ONLINE"] as const;
export const presenceState = pgEnum("presence_state", PRESENCE_STATE_TYPES);
export const MAP_LIST_LAYOUT_TYPES = ["TWO_COLUMNS", "THREE_COLUMNS"] as const;
export const mapListLayout = pgEnum("map_list_layout", MAP_LIST_LAYOUT_TYPES);

export const DEFAULT_USER_OPTIONS = {
  presenceState: "ONLINE" as (typeof presenceState.enumValues)[number],
  hideUserStats: false,
  mapListLayout: "TWO_COLUMNS" as (typeof mapListLayout.enumValues)[number],
};

export const userOptions = pgTable("user_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  presenceState: presenceState("presence_state").default(DEFAULT_USER_OPTIONS.presenceState).notNull(),
  hideUserStats: boolean("hide_user_stats").default(DEFAULT_USER_OPTIONS.hideUserStats).notNull(),
  mapListLayout: mapListLayout("map_list_layout").default(DEFAULT_USER_OPTIONS.mapListLayout).notNull(),
});

export const INPUT_MODE_KEY_TYPES = ["ALT_KANA", "TAB", "NONE"] as const;
export const toggleInputModeKey = pgEnum("toggle_input_mode_key", INPUT_MODE_KEY_TYPES);
export const LINE_COMPLETED_DISPLAY_TYPES = ["HIGH_LIGHT", "NEXT_WORD"] as const;
export const lineCompletedDisplay = pgEnum("line_completed_display", LINE_COMPLETED_DISPLAY_TYPES);
export const WORD_DISPLAY_TYPES = [
  "KANA_ROMA_UPPERCASE",
  "KANA_ROMA_LOWERCASE",
  "ROMA_KANA_UPPERCASE",
  "ROMA_KANA_LOWERCASE",
  "KANA_ONLY",
  "ROMA_UPPERCASE_ONLY",
  "ROMA_LOWERCASE_ONLY",
] as const;
export const mainWordDisplay = pgEnum("main_word_display", WORD_DISPLAY_TYPES);
export const NEXT_DISPLAY_TYPES = ["LYRICS", "WORD"] as const;
export const nextDisplay = pgEnum("next_display", NEXT_DISPLAY_TYPES);
export const TIME_OFFSET_KEY_TYPES = ["CTRL_LEFT_RIGHT", "CTRL_ALT_LEFT_RIGHT", "NONE"] as const;
export const timeOffsetKey = pgEnum("time_offset_key", TIME_OFFSET_KEY_TYPES);

export const DEFAULT_TYPING_OPTIONS = {
  timeOffset: 0,
  mainWordScrollStart: 35,
  subWordScrollStart: 40,
  isSmoothScroll: true,
  mainWordFontSize: 100,
  subWordFontSize: 90,
  mainWordTopPosition: 0,
  subWordTopPosition: 0,
  kanaWordSpacing: 0,
  romaWordSpacing: 0.02,
  typeSound: false,
  missSound: false,
  completedTypeSound: true,
  nextDisplay: "LYRICS" as (typeof nextDisplay.enumValues)[number],
  lineCompletedDisplay: "NEXT_WORD" as (typeof lineCompletedDisplay.enumValues)[number],
  timeOffsetAdjustKey: "CTRL_LEFT_RIGHT" as (typeof timeOffsetKey.enumValues)[number],
  inputModeToggleKey: "ALT_KANA" as (typeof toggleInputModeKey.enumValues)[number],
  wordDisplay: "KANA_ROMA_UPPERCASE" as (typeof mainWordDisplay.enumValues)[number],
  isCaseSensitive: false,
  windowScaleWidth: 1160,
};

export const userTypingOptions = pgTable("user_typing_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  timeOffset: real("time_offset").default(DEFAULT_TYPING_OPTIONS.timeOffset).notNull(),
  mainWordScrollStart: integer("main_word_scroll_start").default(DEFAULT_TYPING_OPTIONS.mainWordScrollStart).notNull(),
  subWordScrollStart: integer("sub_word_scroll_start").default(DEFAULT_TYPING_OPTIONS.subWordScrollStart).notNull(),
  mainWordFontSize: integer("main_word_font_size").default(DEFAULT_TYPING_OPTIONS.mainWordFontSize).notNull(),
  subWordFontSize: integer("sub_word_font_size").default(DEFAULT_TYPING_OPTIONS.subWordFontSize).notNull(),
  mainWordTopPosition: real("main_word_top_position").default(DEFAULT_TYPING_OPTIONS.mainWordTopPosition).notNull(),
  subWordTopPosition: real("sub_word_top_position").default(DEFAULT_TYPING_OPTIONS.subWordTopPosition).notNull(),
  kanaWordSpacing: real("kana_word_spacing").default(DEFAULT_TYPING_OPTIONS.kanaWordSpacing).notNull(),
  romaWordSpacing: real("roma_word_spacing").default(DEFAULT_TYPING_OPTIONS.romaWordSpacing).notNull(),
  typeSound: boolean("type_sound").default(DEFAULT_TYPING_OPTIONS.typeSound).notNull(),
  missSound: boolean("miss_sound").default(DEFAULT_TYPING_OPTIONS.missSound).notNull(),
  completedTypeSound: boolean("completed_type_sound").default(DEFAULT_TYPING_OPTIONS.completedTypeSound).notNull(),
  nextDisplay: nextDisplay("next_display").default(DEFAULT_TYPING_OPTIONS.nextDisplay).notNull(),
  lineCompletedDisplay: lineCompletedDisplay("line_completed_display")
    .default(DEFAULT_TYPING_OPTIONS.lineCompletedDisplay)
    .notNull(),
  timeOffsetAdjustKey: timeOffsetKey("time_offset_adjust_key")
    .default(DEFAULT_TYPING_OPTIONS.timeOffsetAdjustKey)
    .notNull(),
  inputModeToggleKey: toggleInputModeKey("input_mode_toggle_key")
    .default(DEFAULT_TYPING_OPTIONS.inputModeToggleKey)
    .notNull(),
  wordDisplay: mainWordDisplay("main_word_display").default(DEFAULT_TYPING_OPTIONS.wordDisplay).notNull(),
  isSmoothScroll: boolean("is_smooth_scroll").default(DEFAULT_TYPING_OPTIONS.isSmoothScroll).notNull(),
  isCaseSensitive: boolean("is_case_sensitive").default(DEFAULT_TYPING_OPTIONS.isCaseSensitive).notNull(),
  windowScaleWidth: integer("window_scale_width").default(DEFAULT_TYPING_OPTIONS.windowScaleWidth).notNull(),
});

export const DEFAULT_IME_OPTIONS = {
  enableIncludeRegex: false,
  insertEnglishSpaces: false,
  isCaseSensitive: false,
  enableNextLyrics: true,
  includeRegexPattern: "",
  enableLargeVideoDisplay: false,
};

export const userImeTypingOptions = pgTable("user_ime_typing_options", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  enableIncludeRegex: boolean("enable_include_regex").default(false).notNull(),
  insertEnglishSpaces: boolean("insert_english_spaces").default(false).notNull(),
  isCaseSensitive: boolean("is_case_sensitive").default(false).notNull(),
  enableNextLyrics: boolean("enable_next_lyrics").default(true).notNull(),
  includeRegexPattern: varchar("include_regex_pattern", { length: 1024 }).default("").notNull(),
  enableLargeVideoDisplay: boolean("enable_large_video_display").default(false).notNull(),
});
