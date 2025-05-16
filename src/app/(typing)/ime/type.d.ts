export type SceneType = "ready" | "play" | "end";

// parseImeMapの戻り値の型を定義
type ParseMap = {
  lines: {
    time: number;
    word: string;
  }[][];
  words: string[][][][];
};
type Lines = ParseMap["lines"][number][];

export type TypingResult = {
  input: string;
  evaluation: "Great" | "Good" | "Skip" | "None";
  targetWord: string | undefined;
}[];
