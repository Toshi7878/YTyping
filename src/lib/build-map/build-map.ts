import type { MapLine } from "@/server/drizzle/validator/map-json";
import type { ResultData } from "@/server/drizzle/validator/result";
import { zip } from "@/utils/array";
import type { BuiltMapLine, InputMode, TypeChunk } from "../../app/(typing)/type/_lib/type";
import { generateTypingWord } from "./generate-typing-word";
import { kanaSentenceToKanaChunkWords } from "./kana-sentence-to-kana-word-chunks";

export const CHAR_POINT = 50;
export const MISS_PENALTY = CHAR_POINT / 2;

export class BuildMap {
  mapData: BuiltMapLine[];

  startLine: number;
  lineLength: number;
  typingLineIndexes: number[];
  mapChangeCSSCounts: number[];
  initialLineResultData: ResultData;
  totalNotes: BuiltMapLine["notes"];
  speedDifficulty: { median: { r: number; k: number }; max: { r: number; k: number } };
  duration: number;
  keyRate: number;
  missRate: number;

  constructor(data: MapLine[]) {
    const result = this.create({ data });

    this.mapData = result.words;
    this.startLine = result.startLine;

    this.lineLength = result.lineLength;
    this.typingLineIndexes = result.typingLineIndexes;
    this.mapChangeCSSCounts = result.mapChangeCSSCounts;

    this.initialLineResultData = result.initialLineResultData;
    this.totalNotes = this.calculateTotalNotes(result.words);
    this.speedDifficulty = this.calculateSpeedDifficulty(result.words);

    this.duration = Number(this.mapData[result.words.length - 1]!.time);
    this.keyRate = 100 / this.totalNotes.r;
    this.missRate = this.keyRate / 2;
  }

  private create({ data: mapLines }: { data: MapLine[] }) {
    const wordsData: BuiltMapLine[] = [];
    const initialLineResultData: ResultData = [];
    const typingLineIndexes: number[] = [];
    const mapChangeCSSCounts: number[] = [];
    // 譜面作成時にkanaになる?
    const inputMode = (
      typeof window !== "undefined" ? (localStorage.getItem("inputMode") ?? "roma") : "roma"
    ) as InputMode;
    const validatedInputMode = ["roma", "kana", "flick"].includes(inputMode) ? inputMode : "roma";
    let startLine = 0;
    let lineLength = 0;

    const kanaChunkWords = kanaSentenceToKanaChunkWords(mapLines.map((line) => line.word).join("\n"));
    for (const [i, [mapLine, kanaChunkWord]] of zip(mapLines, kanaChunkWords).entries()) {
      const line = {
        time: Number(mapLine.time),
        lyrics: mapLine.lyrics,
        kanaWord: kanaChunkWord.join(""),
        options: mapLine.options,
        word: generateTypingWord(kanaChunkWord),
      };

      if (mapLine.options?.isChangeCSS) {
        mapChangeCSSCounts.push(i);
      }

      const hasWord = !!kanaChunkWord.length;
      const nextLine = mapLines[i + 1];
      if (hasWord && line.lyrics !== "end" && nextLine) {
        if (startLine === 0) {
          startLine = i;
        }

        lineLength++;
        typingLineIndexes.push(i);

        const notes = this.calcLineNotes(line.word);
        wordsData.push({
          kpm: this.calcLineKpm({ notes, lineDuration: Number(nextLine.time) - line.time }),
          notes,
          lineCount: lineLength,
          ...line,
        });

        initialLineResultData.push({
          status: {
            p: 0,
            tBonus: 0,
            lType: 0,
            lMiss: 0,
            lRkpm: 0,
            lKpm: 0,
            lostW: null,
            lLost: 0,
            combo: 0,
            tTime: 0,
            mode: validatedInputMode,
            sp: 1,
          },
          types: [],
        });
      } else {
        wordsData.push({
          kpm: { k: 0, r: 0 },
          notes: { k: 0, r: 0 },
          ...line,
        });

        initialLineResultData.push({
          status: {
            combo: 0,
            tTime: 0,
            mode: validatedInputMode,
            sp: 1,
          },
          types: [],
        });
      }
    }

    return {
      words: wordsData,
      startLine,
      lineLength,
      initialLineResultData,
      typingLineIndexes,
      mapChangeCSSCounts,
    };
  }

  private calcLineKpm({ notes, lineDuration: remainTime }: { notes: BuiltMapLine["notes"]; lineDuration: number }) {
    const romaKpm = Math.max(1, Math.floor((notes.r / remainTime) * 60));
    const kanaKpm = Math.max(1, Math.floor((notes.k / remainTime) * 60));
    return { r: romaKpm, k: kanaKpm };
  }

  private calcLineNotes(word: TypeChunk[]) {
    const kanaWord = word.map((item) => item.k).join("");
    const kanaNotes = calcWordKanaNotes({ kanaWord });
    const romaNotes = word.map((item) => item.r[0]).join("").length;

    return { k: kanaNotes, r: romaNotes };
  }

  private calculateTotalNotes(typingWords: BuiltMapLine[]) {
    return typingWords.reduce(
      (acc, line) => {
        acc.k += line.notes.k;
        acc.r += line.notes.r;
        return acc;
      },
      { k: 0, r: 0 },
    );
  }

  private calculateSpeedDifficulty(typingWords: BuiltMapLine[]) {
    const romaSpeedList = typingWords.map((line) => line.kpm.r);
    const kanaSpeedList = typingWords.map((line) => line.kpm.k);

    const romaMedianSpeed = median(romaSpeedList);
    const kanaMedianSpeed = median(kanaSpeedList);
    const romaMaxSpeed = Math.max(...romaSpeedList);
    const kanaMaxSpeed = Math.max(...kanaSpeedList);

    return {
      median: { r: romaMedianSpeed, k: kanaMedianSpeed },
      max: { r: romaMaxSpeed, k: kanaMaxSpeed },
    };
  }
}

function median(arr: number[]) {
  const nonZeroArray = arr.filter((a) => a !== 0);

  const temp = [...nonZeroArray].sort((a, b) => a - b);
  const half = (temp.length / 2) | 0;

  if (temp.length % 2) {
    return temp[half]!;
  }

  return (temp[half - 1]! + temp[half]!) / 2;
}

export const calcWordKanaNotes = ({ kanaWord }: { kanaWord: string }) => {
  const dakuHandakuLineNotes = (kanaWord.match(/[ゔがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/g) || []).length;
  return kanaWord.length + dakuHandakuLineNotes;
};
