import { ROMA_MAP, SYMBOL_TO_ROMA_MAP } from "./const";

export const sentenceToKanaChunkWords = (sentence: string) => {
  const pattern = Array.from(ROMA_MAP.keys()).concat(Array.from(SYMBOL_TO_ROMA_MAP.keys())).join("|");
  const regex = new RegExp(`(${pattern})`, "g");
  const processed = sentence.replace(regex, "\t$1\t");

  return processed.split("\n").map((line) => {
    const splitLine = line.split("\t").filter((word) => word !== "");

    const result: string[] = [];

    for (const word of splitLine) {
      if (ROMA_MAP.has(word) || SYMBOL_TO_ROMA_MAP.has(word)) {
        result.push(word);
      } else {
        for (const char of word) {
          result.push(char);
        }
      }
    }

    return result;
  });
};
