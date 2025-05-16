import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { useReplaceReadingWithCustomDic } from "@/util/global-hooks/useMorphReplaceCustomDic";

export const useGenerateTokenizedWords = () => {
  const utils = clientApi.useUtils();
  const replaceReadingWithCustomDic = useReplaceReadingWithCustomDic();
  return async (words: string[][]) => {
    const joinedWords = words.flat().join(" ");

    const tokenizedWords = await utils.morphConvert.tokenizeWordAws.fetch({ sentence: joinedWords });
    const formattedTokenizedWords = await replaceReadingWithCustomDic(tokenizedWords);

    const repl = parseRepl(formattedTokenizedWords);

    return replMergeInWords(words, repl);
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

const replMergeInWords = (words: string[][], repl: string[][]) => {
  const replMergedWords: string[][][] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      if (/[一-龥]/.test(word[j])) {
        for (let m = 0; m < repl.length; m++) {
          word[j] = word[j].replace(RegExp(repl[m][0], "g"), "\t@@" + m + "@@\t");
        }
      }
    }
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    const mergedWord: string[][] = [];
    for (let j = 0; j < word.length; j++) {
      let line = word[j].split("\t").filter((x) => x !== "");

      for (let m = 0; m < line.length; m++) {
        let result: string[];
        if (line[m].slice(0, 2) == "@@" && line[m].slice(-2) == "@@" && repl[parseFloat(line[m].slice(2))]) {
          result = repl[parseFloat(line[m].slice(2))];
        } else {
          result = [line[m]];
        }

        mergedWord.push(result);
      }
    }

    replMergedWords.push(mergedWord);
  }

  return replMergedWords;
};
