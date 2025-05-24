export type SceneType = "ready" | "play" | "end";

// parseImeMapの戻り値の型を定義
type ParseMap = {
  lines: {
    time: number;
    word: string;
  }[][];
  words: string[][][][];
  totalNotes: number;
  initWordResults: WordResults;
  textWords: string[];
};
type Lines = ParseMap["lines"][number][];

export type WordResults = {
  inputs: string[];
  evaluation: "Great" | "Good" | "Skip" | "None";
}[];

export type PlaceholderType = "normal" | "skip" | "end";
