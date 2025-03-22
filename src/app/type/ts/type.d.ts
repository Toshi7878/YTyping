export type InputMode = "roma" | "kana" | "flick";
export type PlayMode = "playing" | "replay" | "practice";
export type SceneType = "ready" | "playing" | "end" | "replay" | "practice";

export type TypeChunk = {
  k: string;
  r: string[];
  p: number;
  t: "kana" | "alphabet" | "num" | "symbol" | "space" | undefined;
};

export interface LineData {
  time: number;
  word: TypeChunk[];
  lyrics: string;
  kpm: { k: number; r: number };
  notes: { k: number; r: number };
  lineCount?: number;
  kanaWord: string;
  options?: MapLine["options"];
}

export interface LineWord {
  correct: { k: string; r: string };
  nextChar: TypeChunk;
  word: TypeChunk[];
  kanaDakuten?: string;
  lineCount: number;
}

export interface SendResultData {
  map_id: number;
  status: {
    score: number;
    kana_type: number;
    roma_type: number;
    flick_type: number;
    english_type: number;
    space_type: number;
    symbol_type: number;
    num_type: number;
    miss: number;
    lost: number;
    rkpm: number;
    roma_kpm: number;
    max_combo: number;
    kpm: number;
    default_speed: number;
    clear_rate: number;
  };
}
export interface TypeResult {
  is?: boolean;
  c?: string;
  op?: string;
  t: number;
}

export interface LineResultData {
  status?: {
    p?: number;
    tBonus?: number;
    lType?: number;
    lMiss?: number;
    lRkpm?: number;
    lKpm?: number;
    lostW?: string | null;
    lLost?: number;
    combo: number;
    tTime: number;
    mode: InputMode;
    sp: number;
  };
  typeResult: TypeResult[];
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
