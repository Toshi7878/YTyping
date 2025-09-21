import type { RouterOutPuts } from "@/server/api/trpc";
import { useMorphQueries } from "@/utils/queries/morph.queries";
import { useReplaceReadingWithCustomDic } from "@/utils/useMorphReplaceCustomDic";
import { useQueryClient } from "@tanstack/react-query";

export const useGenerateTokenizedWords = () => {
  const queryClient = useQueryClient();
  const morphQueries = useMorphQueries();
  const replaceReadingWithCustomDic = useReplaceReadingWithCustomDic();
  return async (words: string[][]) => {
    const joinedWords = words.flat().join(" ");

    const tokenizedWords = await queryClient.ensureQueryData(morphQueries.tokenizeSentence({ sentence: joinedWords }));

    const formattedTokenizedWords = await replaceReadingWithCustomDic(tokenizedWords);

    const repl = parseRepl(formattedTokenizedWords);

    return marge(words, repl);
  };
};

const parseRepl = (tokenizedWords: RouterOutPuts["morphConvert"]["tokenizeWordAws"]) => {
  const repl = new Set<string[]>();

  for (let i = 0; i < tokenizedWords.lyrics.length; i++) {
    if (/[一-龥]/.test(tokenizedWords.lyrics[i])) {
      repl.add([tokenizedWords.lyrics[i], tokenizedWords.readings[i]]);
    }
  }

  return Array.from(repl).sort((a, b) => b[0].length - a[0].length);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const marge = (comparisonLyrics: any, repl: string[][]) => {
  for (let i = 0; i < comparisonLyrics.length; i++) {
    for (let j = 0; j < comparisonLyrics[i].length; j++) {
      if (/[一-龥]/.test(comparisonLyrics[i])) {
        for (let m = 0; m < repl.length; m++) {
          comparisonLyrics[i][j] = comparisonLyrics[i][j].replace(RegExp(repl[m][0], "g"), `\t@@${m}@@\t`);
        }
      }
    }
  }

  for (let i = 0; i < comparisonLyrics.length; i++) {
    for (let j = 0; j < comparisonLyrics[i].length; j++) {
      const line = comparisonLyrics[i][j].split("\t").filter((x) => x !== "");

      for (let m = 0; m < line.length; m++) {
        if (line[m].slice(0, 2) === "@@" && line[m].slice(-2) === "@@" && repl[parseFloat(line[m].slice(2))]) {
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
