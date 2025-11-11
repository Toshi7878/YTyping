import { zip } from "@/utils/array";
import type { MapLine } from "@/validator/map-json";
import { useReadImeTypeOptions } from "../atoms/state-atoms";
import type { WordResults } from "../type";
import { useFormatWord } from "./format-word";
import { useGenerateTokenizedWords } from "./repl";

const MIN_LINE_SECONDS = 5;

export const useBuildImeMap = () => {
  const generateTokenizedWords = useGenerateTokenizedWords();
  const readImeTypeOptions = useReadImeTypeOptions();
  const formatWord = useFormatWord();

  return async (mapData: MapLine[]) => {
    let lineWords: string[] = [];
    let lineTimes: number[] = [];
    const lines: { time: number; word: string }[][] = [];

    for (const [i, line] of mapData.entries()) {
      const nextLine = mapData[i + 1];
      const nextToNextLine = mapData[i + 2];

      const formattedLyrics = formatWord(deleteRubyTag(line.lyrics));

      const isTypingLine = isValidTypingLine(formattedLyrics, line.word);

      if (isTypingLine) {
        lineWords.push(formattedLyrics);
        lineTimes.push(Number(line.time));
      }

      const nextTime = getNextTime(nextLine, nextToNextLine);

      const shouldBreakLine = shouldCreateNewLine(lineWords, nextLine, nextTime, lineTimes);

      if (shouldBreakLine) {
        const lastTime = nextLine ? Number(nextLine.time) : Number(line.time) + 10; // 次の行がない場合は10秒後
        lineWords.push("");
        lineTimes.push(lastTime);

        const WordsWithTimes = zip<number, string>(lineTimes, lineWords).map(([time, word]) => ({
          time,
          word,
        }));

        lines.push(WordsWithTimes);

        lineWords = [];
        lineTimes = [];
      }
    }

    const words = await generateTokenizedWords(
      lines.map((line) => {
        const { enableEngSpace } = readImeTypeOptions();

        const words = line.flatMap((chunk) => chunk.word.split(" ")).filter((char) => char !== "");

        if (enableEngSpace) {
          return insertSpacesEng(words);
        }

        return words;
      }),
    );

    const totalNotes = words.flat(2).reduce((acc, word) => acc + (word?.[0]?.length ?? 0), 0);

    const textWords = words.flat(1).map((word) => {
      return word.map((chars) => chars[0]).join("");
    });

    const initWordResults: WordResults = Array.from({ length: textWords.length }, () => ({
      inputs: [],
      evaluation: "Skip" as const,
    }));

    console.log({ lines, words, totalNotes, initWordResults, textWords });

    return { lines, words, totalNotes, initWordResults, textWords };
  };
};

const isValidTypingLine = (formattedLyrics: string, word: string): boolean => {
  return formattedLyrics !== "" && formattedLyrics !== "end" && word.replace(/\s/g, "") !== "";
};

const getNextTime = (nextLine: MapLine | undefined, lineAfterNext: MapLine | undefined): number => {
  if (!nextLine) return 0;

  return lineAfterNext && nextLine.word.replace(/\s/g, "") === "" ? Number(lineAfterNext.time) : Number(nextLine.time);
};

const shouldCreateNewLine = (
  lineChars: string[],
  nextLine: MapLine | undefined,
  nextTime: number,
  lineTimes: number[],
): boolean => {
  return lineChars.length > 0 && (!nextLine || MIN_LINE_SECONDS < nextTime - (lineTimes?.[0] ?? 0));
};

const deleteRubyTag = (text: string) => {
  const rubyMatches = text.match(/<*ruby(?: .+?)?>.*?<.*?\/ruby*>/g);
  if (!rubyMatches) return text;

  let result = text;
  for (const rubyTag of rubyMatches) {
    const start = rubyTag.indexOf(">") + 1;
    const end = rubyTag.indexOf("<rt>");
    const rubyText = rubyTag.slice(start, end);
    result = result.replace(rubyTag, rubyText);
  }

  return result;
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
