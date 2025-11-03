import type { MapLine } from "@/server/drizzle/validator/map-json";

export type InputMode = "roma" | "kana" | "flick";
export type PlayMode = "play" | "replay" | "practice";
export type SceneType = "ready" | PlayMode | "play_end" | "practice_end" | "replay_end";

export type SkipGuideKey = "Space" | null;

export interface TypeChunk {
  k: string;
  r: string[];
  p: number;
  t: "kana" | "alphabet" | "num" | "symbol" | "space" | undefined;
  kanaUnSupportedSymbol?: string;
}

export interface NextTypeChunk extends TypeChunk {
  orginalDakuChar?: Dakuten | HanDakuten;
}

export interface LineWord {
  correct: { k: string; r: string };
  nextChar: NextTypeChunk;
  word: TypeChunk[];
}

export interface BuiltMapLine {
  time: number;
  word: TypeChunk[];
  lyrics: string;
  kpm: { k: number; r: number };
  notes: { k: number; r: number };
  lineCount?: number;
  kanaWord: string;
  options?: MapLine["options"];
}

export type Dakuten =
  | "ゔ"
  | "が"
  | "ぎ"
  | "ぐ"
  | "げ"
  | "ご"
  | "ざ"
  | "じ"
  | "ず"
  | "ぜ"
  | "ぞ"
  | "だ"
  | "ぢ"
  | "づ"
  | "で"
  | "ど"
  | "ば"
  | "び"
  | "ぶ"
  | "べ"
  | "ぼ";

export type NormalizeHirakana =
  | "う"
  | "か"
  | "き"
  | "く"
  | "け"
  | "こ"
  | "さ"
  | "し"
  | "す"
  | "せ"
  | "そ"
  | "た"
  | "ち"
  | "つ"
  | "て"
  | "と"
  | "は"
  | "ひ"
  | "ふ"
  | "へ"
  | "ほ";

export type HanDakuten = "ぱ" | "ぴ" | "ぷ" | "ぺ" | "ぽ";
