export type SceneType = "ready" | "play" | "end";

export type BuildMap = {
  lines: {
    time: number;
    word: string;
  }[][];
  words: string[][][][];
  totalNotes: number;
  initWordResults: WordResults;
  textWords: string[];
};

export type WordResults = {
  inputs: string[];
  evaluation: "Great" | "Good" | "Skip" | "None";
}[];

export type PlaceholderType = "normal" | "skip" | "end";
