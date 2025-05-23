import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { useReplaceReadingWithCustomDic } from "@/util/global-hooks/useMorphReplaceCustomDic";

export const useGenerateTokenizedWords = () => {
  const utils = clientApi.useUtils();
  const replaceReadingWithCustomDic = useReplaceReadingWithCustomDic();
  return async (words: string[][]) => {
    const joinedWords = words.flat().join(" ");

    const tokenizedWords = await utils.morphConvert.tokenizeWordAws.ensureData({ sentence: joinedWords });
    const formattedTokenizedWords = await replaceReadingWithCustomDic(tokenizedWords);

    const repl = parseRepl(formattedTokenizedWords);

    return marge(words, repl);
  };
};

const parseRepl = (tokenizedWords: RouterOutPuts["morphConvert"]["tokenizeWordAws"]) => {
  let repl = new Set<string[]>();

  for (let i = 0; i < tokenizedWords.lyrics.length; i++) {
    if (/[一-龥]/.test(tokenizedWords.lyrics[i])) {
      repl.add([tokenizedWords.lyrics[i], tokenizedWords.readings[i]]);
    }
  }

  return Array.from(repl).sort((a, b) => b[0].length - a[0].length);
};

const marge = (comparisonLyrics: any, repl: string[][]) => {
  for (let i = 0; i < comparisonLyrics.length; i++) {
    for (let j = 0; j < comparisonLyrics[i].length; j++) {
      if (/[一-龥]/.test(comparisonLyrics[i])) {
        for (let m = 0; m < repl.length; m++) {
          comparisonLyrics[i][j] = comparisonLyrics[i][j].replace(RegExp(repl[m][0], "g"), "\t@@" + m + "@@\t");
        }
      }
    }
  }

  for (let i = 0; i < comparisonLyrics.length; i++) {
    for (let j = 0; j < comparisonLyrics[i].length; j++) {
      let line = comparisonLyrics[i][j].split("\t").filter((x) => x !== "");

      for (let m = 0; m < line.length; m++) {
        if (line[m].slice(0, 2) == "@@" && line[m].slice(-2) == "@@" && repl[parseFloat(line[m].slice(2))]) {
          line[m] = repl[parseFloat(line[m].slice(2))];
        } else {
          line[m] = [line[m]];
        }
      }

      comparisonLyrics[i][j] = line;
    }
  }

  return comparisonLyrics as string[][][][];
};
