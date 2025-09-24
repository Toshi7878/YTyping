import type { MapLine } from "@/server/drizzle/validator/map-json";
import { useReadImeTypeOptions } from "../atoms/stateAtoms";
import type { WordResults } from "../type";
import { useFormatWord } from "./formatWord";
import { useGenerateTokenizedWords } from "./repl";

const MIN_LINE_SECONDS = 5;

export const useParseImeMap = () => {
  const generateTokenizedWords = useGenerateTokenizedWords();
  const readImeTypeOptions = useReadImeTypeOptions();
  const formatWord = useFormatWord();

  return async (mapData: MapLine[]) => {
    let lineWords: string[] = [];
    let lineTimes: number[] = [];
    const lines: { time: number; word: string }[][] = [];

    for (let i = 0; i < mapData.length; i++) {
      const line = mapData[i];
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
        const lastTime = nextLine ? Number(nextLine.time) : lineTimes[lineTimes.length - 1] + 10; // 次の行がない場合は10秒後
        lineTimes.push(lastTime);
        lineWords.push("");

        //   const prevDisplayLyrics = displayLyrics[displayLyrics.length - 1];

        //   if (prevDisplayLyrics) {
        //     connectWithPreviousLyrics(displayLyrics, lineTimes);
        //   }

        const line = lineWords.map((word, index) => ({ time: lineTimes[index], word }));

        lines.push(line);

        lineWords = [];
        lineTimes = [];
      }
    }

    const words = await generateTokenizedWords(
      lines.map((line) => {
        const { enableEngSpace } = readImeTypeOptions();

        const words = line
          .map((chunk) => chunk.word.split(" "))
          .flat()
          .filter((char) => char !== "");

        if (enableEngSpace) {
          return insertSpacesEng(words);
        }

        return words;
      }),
    );

    const totalNotes = words.flat(2).reduce((acc, word) => acc + word[0].length, 0);

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
  return lineChars.length > 0 && (!nextLine || MIN_LINE_SECONDS < nextTime - lineTimes[0]);
};

const deleteRubyTag = (text: string) => {
  const ruby_convert = text.match(/<*ruby(?: .+?)?>.*?<.*?\/ruby*>/g);
  if (ruby_convert) {
    for (let v = 0; v < ruby_convert.length; v++) {
      const start = ruby_convert[v].indexOf(">") + 1;
      const end = ruby_convert[v].indexOf("<rt>");
      const ruby = ruby_convert[v].slice(start, end);
      text = text.replace(ruby_convert[v], ruby);
    }
  }
  return text;
};

const insertSpacesEng = (words: string[]) => {
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    const isCurrentWordAllHankaku = /^[!-~]*$/.test(currentWord);
    const nextWord = words[i + 1];

    if (isCurrentWordAllHankaku && nextWord) {
      if (/^[!-~]*$/.test(nextWord[0])) {
        // eslint-disable-next-line prefer-template
        words[i] = words[i] + " ";
      }
    }
  }

  return words;
};
