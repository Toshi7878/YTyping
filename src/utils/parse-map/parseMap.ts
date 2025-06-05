import { MapLine } from "@/types/map";
import { InputMode, LineData, LineResultData, LineWord, TypeChunk } from "../../app/(typing)/type/ts/type";
import { generateTypingWord } from "./generateTypingWord";
import { KANA_TO_ROMA_MAP, SYMBOL_TO_ROMA_MAP } from "./romaMap";

export const CHAR_POINT = 50;
export const MISS_PENALTY = CHAR_POINT / 2;

export class ParseMap {
  mapData: LineData[];

  startLine: number;
  lineLength: number;
  typingLineIndexes: number[];
  mapChangeCSSCounts: number[];
  initialLineResultData: LineResultData[];
  totalNotes: LineData["notes"];
  speedDifficulty: { median: { r: number; k: number }; max: { r: number; k: number } };
  movieTotalTime: number;
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

    this.movieTotalTime = Number(this.mapData[result.words.length - 1].time);
    this.keyRate = 100 / this.totalNotes.r;
    this.missRate = this.keyRate / 2;
  }

  private create({ data }: { data: MapLine[] }) {
    const wordsData: LineData[] = [];
    const initialLineResultData: LineResultData[] = [];
    const typingLineIndexes: number[] = [];
    const mapChangeCSSCounts: number[] = [];
    const inputMode = (
      typeof window !== "undefined" ? localStorage.getItem("inputMode") ?? "roma" : "roma"
    ) as InputMode;
    const validatedInputMode = ["roma", "kana", "flick"].includes(inputMode) ? inputMode : "roma";
    let startLine = 0;
    let lineLength = 0;

    const tokenizedKanaLyrics = tokenizeKanaBySentenceRomaPatterns(data.map((line) => line["word"]).join("\n"));

    for (let i = 0; i < data.length; i++) {
      const tokenizedKanaWord = tokenizedKanaLyrics[i];

      const line = {
        time: Number(data[i]["time"]),
        lyrics: data[i]["lyrics"],
        kanaWord: tokenizedKanaWord.join(""),
        options: data[i]["options"],
        word: generateTypingWord(tokenizedKanaWord),
      };

      if (line.options?.isChangeCSS) {
        mapChangeCSSCounts.push(i);
      }

      const hasWord = tokenizedKanaWord.length;
      if (hasWord && line.lyrics !== "end") {
        if (startLine === 0) {
          startLine = i;
        }

        lineLength++;
        typingLineIndexes.push(i);

        const notes = this.calcLineNotes(line.word);
        wordsData.push({
          kpm: this.calcLineKpm({ notes, lineDuration: Number(data[i + 1]["time"]) - line.time }),
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
          typeResult: [],
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
          typeResult: [],
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

  private calcLineKpm({ notes, lineDuration: remainTime }: { notes: LineData["notes"]; lineDuration: number }) {
    const romaKpm = Math.floor((notes.r / remainTime) * 60);
    const kanaKpm = Math.floor((notes.k / remainTime) * 60);
    return { r: romaKpm, k: kanaKpm };
  }

  private calcLineNotes(word: TypeChunk[]) {
    const kanaWord = word.map((item) => item.k).join("");
    const kanaNotes = calcWordKanaNotes({ kanaWord });
    const romaNotes = word.map((item) => item.r[0]).join("").length;

    return { k: kanaNotes, r: romaNotes };
  }

  private calculateTotalNotes(typingWords: LineData[]) {
    return typingWords.reduce(
      (acc, line) => {
        acc.k += line.notes.k;
        acc.r += line.notes.r;
        return acc;
      },
      { k: 0, r: 0 }
    );
  }

  private calculateSpeedDifficulty(typingWords: LineData[]) {
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
  arr = arr.filter(function (a) {
    return a !== 0;
  });
  var half = (arr.length / 2) | 0;
  var temp = arr.sort((a, b) => a - b);

  if (temp.length % 2) {
    return temp[half];
  }

  return (temp[half - 1] + temp[half]) / 2;
}

export function romaConvert(lineWord: LineWord) {
  const dakuten = lineWord.nextChar.orginalDakuChar;
  const tokenizedKanaWord = tokenizeKanaBySentenceRomaPatterns(
    (dakuten ? dakuten : lineWord.nextChar["k"]) + lineWord.word.map((char) => char["k"]).join("")
  );
  const nextPoint = lineWord.nextChar["p"];

  const word = generateTypingWord(tokenizedKanaWord[0]);

  return { nextChar: { ...word[0], p: nextPoint }, word: word.slice(1) };
}

export const calcWordKanaNotes = ({ kanaWord }: { kanaWord: string }) => {
  const dakuHandakuLineNotes = (kanaWord.match(/[ゔがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/g) || []).length;
  return kanaWord.length + dakuHandakuLineNotes;
};

const tokenizeKanaBySentenceRomaPatterns = (kanaSentence: string) => {
  const pattern = Array.from(KANA_TO_ROMA_MAP.keys()).concat(Array.from(SYMBOL_TO_ROMA_MAP.keys())).join("|");
  const regex = new RegExp(`(${pattern})`, "g");
  const processed = kanaSentence.replace(regex, "\t$1\t");

  return processed.split("\n").map((line) => {
    const splitLine = line.split("\t").filter((word) => word !== "");

    const result: string[] = [];

    for (const word of splitLine) {
      if (KANA_TO_ROMA_MAP.has(word) || SYMBOL_TO_ROMA_MAP.has(word)) {
        result.push(word);
      } else {
        for (let i = 0; i < word.length; i++) {
          result.push(word[i]);
        }
      }
    }

    return result;
  });
};
