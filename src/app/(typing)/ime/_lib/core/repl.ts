import { replaceReadingWithCustomDict } from "@/lib/build-map/replace-reading-with-custom-dict";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";
import { zip } from "@/utils/array";
import type { BuiltImeMap } from "../type";

export const generateLyricsWithReadings = async (comparisonLyrics: string[][]) => {
  const queryClient = getQueryClient();
  const trpc = getTRPCOptionsProxy();
  return await queryClient.ensureQueryData(
    trpc.morphConvert.tokenizeSentence.queryOptions(
      { sentence: comparisonLyrics.flat().join(" ") },
      {
        staleTime: Infinity,
        gcTime: Infinity,
        select: async (data) => await replaceReadingWithCustomDict(data),
      },
    ),
  );
};

export const generateImeWords = async (
  lines: BuiltImeMap["lines"],
  generateLyricsWithReadings: (comparisonLyrics: string[][]) => Promise<{
    lyrics: string[];
    readings: string[];
  }>,
  { insertEnglishSpaces = false }: { insertEnglishSpaces?: boolean },
) => {
  const comparisonLyrics = lines.map((line) => {
    const lyrics = line.flatMap((chunk) => chunk.word.split(" ")).filter((char) => char !== "");

    if (insertEnglishSpaces) {
      return insertSpacesEng(lyrics);
    }

    return lyrics;
  });

  const lyricsWithReadings = await generateLyricsWithReadings(comparisonLyrics);
  return mergeWordsWithReadingReplacements({ lyricsWithReadings, comparisonLyrics });
};

const insertSpacesEng = (words: string[]) => {
  const insertedSpaceWords = words;
  for (const [i, currentWord] of insertedSpaceWords.entries()) {
    const isCurrentWordAllHankaku = /^[!-~]*$/.test(currentWord);
    const nextWord = insertedSpaceWords[i + 1];

    if (isCurrentWordAllHankaku && nextWord && nextWord[0]) {
      if (/^[!-~]*$/.test(nextWord[0])) {
        insertedSpaceWords[i] = insertedSpaceWords[i] + " ";
      }
    }
  }

  return insertedSpaceWords;
};

const mergeWordsWithReadingReplacements = ({
  lyricsWithReadings,
  comparisonLyrics,
}: {
  lyricsWithReadings: { lyrics: string[]; readings: string[] };
  comparisonLyrics: string[][];
}): string[][][][] => {
  const repl = parseRepl(lyricsWithReadings);

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

const parseRepl = (tokenizedWords: { lyrics: string[]; readings: string[] }) => {
  const repl = new Set<string[]>();

  for (const [lyric, reading] of zip(tokenizedWords.lyrics, tokenizedWords.readings)) {
    if (/[一-龥]/.test(lyric)) {
      repl.add([lyric, reading]);
    }
  }

  return Array.from(repl).sort((a, b) => (b[0]?.length ?? 0) - (a[0]?.length ?? 0));
};
