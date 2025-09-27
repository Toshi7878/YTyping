// Central limits for data sizes stored in DB
// Aligns with existing validators in `src/validator/const.ts` and UI usage.

import type {
  InputModeToggleKeyEnum,
  lineCompletedDisplayEnum,
  mainWordDisplayEnum,
  nextDisplayEnum,
  timeOffsetAdjustKeyEnum,
} from "./schema/user";

export const MAX_SHORT_LENGTH = 256;
export const MAX_MEDIUM_LENGTH = 512;
export const MAX_MAXIMUM_LENGTH = 1024;

// Field-specific lengths
export const VIDEO_ID_LENGTH = 11; // YouTube video id
export const PREVIEW_TIME_MAX_LENGTH = MAX_SHORT_LENGTH; // numeric string

export const TITLE_MAX_LENGTH = MAX_SHORT_LENGTH;
export const ARTIST_NAME_MAX_LENGTH = MAX_SHORT_LENGTH;
export const MUSIC_SOURCE_MAX_LENGTH = MAX_SHORT_LENGTH;
export const CREATOR_COMMENT_MAX_LENGTH = MAX_MAXIMUM_LENGTH;

export const TAG_VALUE_MAX_LENGTH = MAX_SHORT_LENGTH;
export const TAG_MAX_LEN = 10; // matches src/app/edit/_lib/const.ts

export const FINGER_CHART_URL_MAX_LENGTH = 100; // matches validator
export const MY_KEYBOARD_MAX_LENGTH = MAX_SHORT_LENGTH;

// IME options and misc text fields
export const ADD_SYMBOL_LIST_MAX_LENGTH = MAX_MAXIMUM_LENGTH;

// Morph dictionary
export const MORPH_SURFACE_MAX_LENGTH = MAX_SHORT_LENGTH;
export const MORPH_READING_MAX_LENGTH = MAX_SHORT_LENGTH;

// Fix word edit logs
export const FIX_WORD_LYRICS_MAX_LENGTH = MAX_MAXIMUM_LENGTH;
export const FIX_WORD_WORD_MAX_LENGTH = MAX_SHORT_LENGTH;

// Enum value union types
type NextDisplay = (typeof nextDisplayEnum.enumValues)[number];
type LineCompletedDisplay = (typeof lineCompletedDisplayEnum.enumValues)[number];
type TimeOffsetAdjustKey = (typeof timeOffsetAdjustKeyEnum.enumValues)[number];
type ToggleInputModeKey = (typeof InputModeToggleKeyEnum.enumValues)[number];
type MainWordDisplay = (typeof mainWordDisplayEnum.enumValues)[number];

export const DEFAULT_TYPING_OPTIONS = {
  timeOffset: 0,
  kanaWordScroll: 10,
  romaWordScroll: 16,
  //TODO: fontSize, TopPositionの命名をmain / subに変更
  romaWordFontSize: 90,
  kanaWordFontSize: 100,
  kanaWordSpacing: 0.08,
  romaWordSpacing: 0.08,
  kanaWordTopPosition: 0,
  romaWordTopPosition: 0,
  typeSound: false,
  missSound: false,
  completedTypeSound: false,
  nextDisplay: "LYRICS" as NextDisplay,
  lineCompletedDisplay: "NEXT_WORD" as LineCompletedDisplay,
  timeOffsetAdjustKey: "CTRL_LEFT_RIGHT" as TimeOffsetAdjustKey,
  InputModeToggleKey: "ALT_KANA" as ToggleInputModeKey,
  wordDisplay: "KANA_ROMA_UPPERCASE" as MainWordDisplay,
};

// Structured mapping per table/column (optional, for clarity)
export const DB_MAX = {
  maps: {
    video_id: VIDEO_ID_LENGTH,
    title: TITLE_MAX_LENGTH,
    artist_name: ARTIST_NAME_MAX_LENGTH,
    music_source: MUSIC_SOURCE_MAX_LENGTH,
    creator_comment: CREATOR_COMMENT_MAX_LENGTH,
    preview_time: PREVIEW_TIME_MAX_LENGTH,
    tag_value: TAG_VALUE_MAX_LENGTH,
    tag_count: TAG_MAX_LEN,
  },
  users: {
    name: 15, // see nameSchema validator
    email_hash: MAX_SHORT_LENGTH,
  },
  user_profiles: {
    finger_chart_url: FINGER_CHART_URL_MAX_LENGTH,
    my_keyboard: MY_KEYBOARD_MAX_LENGTH,
  },
  user_ime_typing_options: {
    add_symbol_list: ADD_SYMBOL_LIST_MAX_LENGTH,
  },
  morph_convert_kana_dic: {
    surface: MORPH_SURFACE_MAX_LENGTH,
    reading: MORPH_READING_MAX_LENGTH,
  },
  fix_word_edit_logs: {
    lyrics: FIX_WORD_LYRICS_MAX_LENGTH,
    word: FIX_WORD_WORD_MAX_LENGTH,
  },
} as const;
