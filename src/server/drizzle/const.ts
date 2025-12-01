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

export const SUPABASE_PUBLIC_BUCKET = "ytyping-public";

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
  completedTypeSound: false,
  nextDisplay: "LYRICS" as (typeof nextDisplayEnum.enumValues)[number],
  lineCompletedDisplay: "NEXT_WORD" as (typeof lineCompletedDisplayEnum.enumValues)[number],
  timeOffsetAdjustKey: "CTRL_LEFT_RIGHT" as (typeof timeOffsetAdjustKeyEnum.enumValues)[number],
  InputModeToggleKey: "ALT_KANA" as (typeof InputModeToggleKeyEnum.enumValues)[number],
  wordDisplay: "KANA_ROMA_UPPERCASE" as (typeof mainWordDisplayEnum.enumValues)[number],
  isCaseSensitive: false,
};
