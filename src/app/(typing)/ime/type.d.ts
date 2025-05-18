export type SceneType = "ready" | "play" | "end";

// parseImeMapの戻り値の型を定義
type ParseMap = {
  lines: {
    time: number;
    word: string;
  }[][];
  words: string[][][][];
  totalNotes: number;
};
type Lines = ParseMap["lines"][number][];

export type WordsResult = {
  input: string;
  evaluation: "Great" | "Good" | "Skip" | "None";
  targetWord: string | undefined;
  wordIndex: number;
}[];
