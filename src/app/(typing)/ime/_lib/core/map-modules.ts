import type { BuiltImeMap, WordResults } from "../type";

export const getTotalNotes = (words: BuiltImeMap["words"]) => {
  return words.flat(2).reduce((acc, word) => acc + (word?.[0]?.length ?? 0), 0);
};

export const createFlatWords = (words: BuiltImeMap["words"]) => {
  return words.flat(1).map((word) => {
    return word.map((chars) => chars[0]).join("");
  });
};

export const createInitWordResults = (flatWords: string[]): WordResults => {
  return Array.from({ length: flatWords.length }, () => ({
    inputs: [],
    evaluation: "Skip" as const,
  }));
};
