export type SceneType = "ready" | "play" | "end";

export type BuiltImeMap = {
  lines: {
    startTime: number;
    word: string;
    endTime: number;
  }[][];
  words: string[][][][];
  totalNotes: number;
  initWordResults: WordResults;
  flatWords: string[];
};

export type WordResults = {
  inputs: string[];
  evaluation: "Great" | "Good" | "Skip" | "None";
}[];

export type PlaceholderType = "normal" | "skip" | "end";
