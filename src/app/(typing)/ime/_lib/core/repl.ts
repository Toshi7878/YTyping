import { replaceReadingWithCustomDict } from "@/lib/build-map/replace-reading-with-custom-dict";
import type { RouterOutPuts } from "@/server/api/trpc";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";
import { zip } from "@/utils/array";

export const generateTokenizedWords = async (words: string[][]) => {
  const joinedLyrics = words.flat().join(" ");

  const queryClient = getQueryClient();
  const trpc = getTRPCOptionsProxy();

  const tokenizedWords = await queryClient.ensureQueryData(
    trpc.morphConvert.tokenizeSentence.queryOptions(
      { sentence: joinedLyrics },
      { staleTime: Infinity, gcTime: Infinity },
    ),
  );

  const formattedTokenizedWords = await replaceReadingWithCustomDict(tokenizedWords);

  const repl = parseRepl(formattedTokenizedWords);

  return marge(words, repl);
};

const parseRepl = (tokenizedWords: RouterOutPuts["morphConvert"]["tokenizeSentence"]) => {
  const repl = new Set<string[]>();

  for (const [lyric, reading] of zip(tokenizedWords.lyrics, tokenizedWords.readings)) {
    if (/[一-龥]/.test(lyric)) {
      repl.add([lyric, reading]);
    }
  }

  return Array.from(repl).sort((a, b) => (b[0]?.length ?? 0) - (a[0]?.length ?? 0));
};

const marge = (comparisonLyrics: string[][], repl: string[][]): string[][][][] => {
  // 第1段階: 文字列内の漢字をプレースホルダーに置換
  const markedLyrics: string[][] = comparisonLyrics.map((lyrics) =>
    lyrics.map((lyric) => {
      let marked = lyric;
      if (/[一-龥]/.test(lyric)) {
        for (const [m, replItem] of repl.entries()) {
          marked = marked.replace(RegExp(replItem[0] ?? "", "g"), `\t@@${m}@@\t`);
        }
      }
      return marked;
    }),
  );

  // 第2段階: プレースホルダーを読み配列に変換
  const result: string[][][][] = markedLyrics.map((lyrics) =>
    lyrics.map((lyric) => {
      const tokens = lyric.split("\t").filter((x) => x !== "");

      return tokens.map((token) => {
        if (token.slice(0, 2) === "@@" && token.slice(-2) === "@@") {
          const index = parseFloat(token.slice(2));
          const replItem = repl[index];
          return replItem ?? [token];
        }
        return [token];
      });
    }),
  );

  return result;
};
