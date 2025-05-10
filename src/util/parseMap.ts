import { ALPHABET_LIST, NUM_LIST } from "@/config/consts/charList";
import { MapLine } from "@/types/map";
import { InputMode, LineData, LineResultData, LineWord, TypeChunk } from "../app/type/ts/type";
import { KANA_TO_ROMA_MAP, SYMBOL_TO_ROMA_MAP } from "../config/consts/romaMap";

// prettier-ignore
const ZENKAKU_LIST = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９", "Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ", "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ", "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ", "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ", "～", "＆", "％", "！", "？", "＠", "＃", "＄", "（", "）", "｜", "｛", "｝", "｀", "＊", "＋", "：", "；", "＿", "＜", "＞", "＝", "＾", ]
// prettier-ignore
const NN_LIST = ["あ", "い", "う", "え", "お", "な", "に", "ぬ", "ね", "の", "や", "ゆ", "よ", "ん", "'", "’", "a", "i", "u", "e", "o", "y", "n", "A", "I", "U", "E", "O", "Y", "N", ];
// prettier-ignore
const SOKUON_JOIN_LIST = ["ヰ", "ゐ", "ヱ", "ゑ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゃ", "ゅ", "ょ", "っ", "ゎ", "ヵ", "ヶ", "ゔ", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "は", "ひ","ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", ]
// prettier-ignore
const KANA_UNSUPPORTED_SYMBOLS = ["←", "↓", "↑", "→"]
// prettier-ignore
const PREVIOUS_KANA_CONVERT_ZENKAKU_SYMBOLS = { "!": "！", "?": "？" } as const;
export const CHAR_POINT = 50;
export const MISS_PENALTY = CHAR_POINT / 2;

class TypingWord {
  typeChunks: TypeChunk[];

  constructor(tokenizedKanaWord: string[]) {
    const hasWord = tokenizedKanaWord.length;

    if (hasWord) {
      this.typeChunks = this.generateTypeChunks(tokenizedKanaWord);
    } else {
      this.typeChunks = [{ k: "", r: [""], p: 0, t: undefined }];
    }
  }

  private getCharType({ kanaChar, romaChar }: { kanaChar: string; romaChar: string }): TypeChunk["t"] {
    if (KANA_TO_ROMA_MAP.has(kanaChar)) {
      return "kana";
    } else if (ALPHABET_LIST.includes(romaChar)) {
      return "alphabet";
    } else if (NUM_LIST.includes(romaChar)) {
      return "num";
    } else if (romaChar === " ") {
      return "space";
    } else {
      return "symbol";
    }
  }

  private generateTypeChunks(tokenizedKanaWord: string[]) {
    let typeChunks: TypeChunk[] = [];

    for (let i = 0; i < tokenizedKanaWord.length; i++) {
      const kanaChar = tokenizedKanaWord[i];
      const romaPatterns = [...(KANA_TO_ROMA_MAP.get(kanaChar) || SYMBOL_TO_ROMA_MAP.get(kanaChar) || [kanaChar])];

      typeChunks.push({
        k: kanaChar,
        r: romaPatterns,
        p: CHAR_POINT * romaPatterns[0].length,
        t: this.getCharType({ kanaChar, romaChar: romaPatterns[0] }),
        ...(KANA_UNSUPPORTED_SYMBOLS.includes(kanaChar) && { kanaUnSupportedSymbol: kanaChar }),
      });

      //打鍵パターンを正規化 (促音結合 / n → nn)
      // ============================================================================================

      if (typeChunks.length >= 2) {
        const prevKanaChar = typeChunks[typeChunks.length - 2]?.k;

        if (prevKanaChar?.[prevKanaChar.length - 1] === "っ") {
          const currentKanaChar = typeChunks[typeChunks.length - 1]["k"][0];

          if (SOKUON_JOIN_LIST.includes(currentKanaChar)) {
            typeChunks = this.joinSokuonPattern({ typeChunks: typeChunks, joinType: "normal" });
          } else if (["い", "う", "ん"].includes(currentKanaChar)) {
            typeChunks = this.joinSokuonPattern({ typeChunks: typeChunks, joinType: "iun" });
          }
        }
      }

      const prevKanaChar = typeChunks[typeChunks.length - 2]?.k ?? "";
      const currentKanaChar = typeChunks[typeChunks.length - 1].k;

      if (prevKanaChar[prevKanaChar.length - 1] === "ん") {
        if (NN_LIST.includes(currentKanaChar)) {
          typeChunks = this.replaceNWithNN(typeChunks);
        } else {
          typeChunks = this.applyDoubleNTypePattern(typeChunks);
        }
      }
    }

    //this.kanaArray最後の文字が「ん」だった場合も[nn]に置き換えます。
    if (typeChunks[typeChunks.length - 1]["k"] === "ん") {
      typeChunks[typeChunks.length - 1]["r"][0] = "nn";
      typeChunks[typeChunks.length - 1]["r"].push("n'");
      typeChunks[typeChunks.length - 1]["p"] = CHAR_POINT * typeChunks[typeChunks.length - 1]["r"][0].length;
    }

    return typeChunks;
  }

  private joinSokuonPattern({ joinType, typeChunks }: { joinType: "normal" | "iun"; typeChunks: TypeChunk[] }) {
    let continuous: string[] = [];
    let xtu: string[] = [];
    let ltu: string[] = [];
    let xtsu: string[] = [];
    let ltsu: string[] = [];

    const prevKanaChar = typeChunks[typeChunks.length - 2]["k"];
    const currentKanaChar = typeChunks[typeChunks.length - 1]["k"];

    typeChunks[typeChunks.length - 1]["k"] = prevKanaChar + currentKanaChar;
    typeChunks.splice(-2, 1);

    const sokuonLength = (prevKanaChar.match(/っ/g) || []).length;
    const romaPatterns = typeChunks[typeChunks.length - 1]["r"];
    const romaPatternsLength = romaPatterns.length;

    for (let i = 0; i < romaPatternsLength; i++) {
      if (joinType === "normal" || !["i", "u", "n"].includes(romaPatterns[i][0])) {
        continuous.push(romaPatterns[i][0].repeat(sokuonLength) + romaPatterns[i]);
      }

      xtu.push("x".repeat(sokuonLength) + "tu" + romaPatterns[i]);
      ltu.push("l".repeat(sokuonLength) + "tu" + romaPatterns[i]);
      xtsu.push("x".repeat(sokuonLength) + "tsu" + romaPatterns[i]);
      ltsu.push("l".repeat(sokuonLength) + "tsu" + romaPatterns[i]);
    }

    typeChunks[typeChunks.length - 1]["r"] = [...continuous, ...xtu, ...ltu, ...xtsu, ...ltsu];
    typeChunks[typeChunks.length - 1]["p"] = CHAR_POINT * romaPatterns[0].length;

    return typeChunks;
  }

  private replaceNWithNN(typeChunks: TypeChunk[]) {
    const prevRomaPatterns = typeChunks[typeChunks.length - 2]["r"];
    const prevRomaPatternsLength = typeChunks[typeChunks.length - 2]["r"].length;

    for (let i = 0; i < prevRomaPatternsLength; i++) {
      const romaPattern = prevRomaPatterns[i];
      const isNnPattern =
        (romaPattern.length >= 2 &&
          romaPattern[romaPattern.length - 2] !== "x" &&
          romaPattern[romaPattern.length - 1] === "n") ||
        romaPattern === "n";

      if (isNnPattern) {
        typeChunks[typeChunks.length - 2]["r"][i] = prevRomaPatterns[i] + "n";
        typeChunks[typeChunks.length - 2]["r"].push("n'");
        typeChunks[typeChunks.length - 2]["p"] = CHAR_POINT * prevRomaPatterns[i].length;
      }
    }

    return typeChunks;
  }

  private applyDoubleNTypePattern(typeChunks: TypeChunk[]) {
    const currentKanaChar = typeChunks[typeChunks.length - 1].k;

    if (currentKanaChar) {
      //n一つのパターンでもnext typeChunkにnを追加してnnの入力を可能にする
      const currentRomaPatterns = typeChunks[typeChunks.length - 1]["r"];
      const currentRomaPatternsLength = currentRomaPatterns.length;

      for (let i = 0; i < currentRomaPatternsLength; i++) {
        typeChunks[typeChunks.length - 1]["r"].push("n" + currentRomaPatterns[i]);
        typeChunks[typeChunks.length - 1]["r"].push("'" + currentRomaPatterns[i]);
      }
    }

    return typeChunks;
  }
}

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
    const tokenizedKanaLyrics = tokenizeKanaBySentenceRomaPatterns(
      data
        .map((line) => line["word"].trim())
        .join("\n")
        .replace(/　/g, " ")
        .replace(/ {2,}/g, " ")
    );

    const result = this.create({ tokenizedKanaLyrics, data });

    this.mapData = result.words;
    this.startLine = result.startLine;

    this.lineLength = result.lineLength;
    this.typingLineIndexes = result.typingLineIndexes;
    this.mapChangeCSSCounts = result.mapChangeCSSCounts;

    this.initialLineResultData = result.initialLineResultData;
    this.totalNotes = this.calculateTotalNotes(result.words);
    this.speedDifficulty = this.calculateSpeedDifficulty(result.words);

    this.movieTotalTime = +this.mapData[result.words.length - 1].time;
    this.keyRate = 100 / this.totalNotes.r;
    this.missRate = this.keyRate / 2;
  }

  private create({ tokenizedKanaLyrics, data }: { tokenizedKanaLyrics: string[][]; data: MapLine[] }) {
    const wordsData: LineData[] = [];
    const initialLineResultData: LineResultData[] = [];
    const typingLineIndexes: number[] = [];
    const mapChangeCSSCounts: number[] = [];
    const inputMode = (localStorage.getItem("inputMode") ?? "roma") as InputMode;
    const validatedInputMode = ["roma", "kana", "flick"].includes(inputMode) ? inputMode : "roma";
    let startLine = 0;
    let lineLength = 0;

    for (let i = 0; i < data.length; i++) {
      const tokenizedKanaWord = tokenizedKanaLyrics[i];

      const line = {
        time: Number(data[i]["time"]),
        lyrics: data[i]["lyrics"],
        kanaWord: tokenizedKanaWord.join(""),
        options: data[i]["options"],
        word: new TypingWord(tokenizedKanaWord).typeChunks,
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

  const { typeChunks: word } = new TypingWord(tokenizedKanaWord[0]);

  return { nextChar: { ...word[0], p: nextPoint }, word: word.slice(1) };
}

function isFullWidth(char: string): boolean {
  // 文字コードを取得
  const code = char.charCodeAt(0);

  // 全角の範囲を判定
  // 全角スペース
  if (code === 0x3000) return true;

  // CJK統合漢字、ひらがな、カタカナなど
  if (code >= 0x3000 && code <= 0x9fff) return true;

  // 全角英数字や記号
  if (code >= 0xff00 && code <= 0xffef) return true;

  return false;
}

export const calcWordKanaNotes = ({ kanaWord }: { kanaWord: string }) => {
  const dakuHandakuLineNotes = (kanaWord.match(/[ゔがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/g) || []).length;
  return kanaWord.length + dakuHandakuLineNotes;
};

const tokenizeKanaBySentenceRomaPatterns = (kanaSentence: string) => {
  // すべてのキーを一つの正規表現パターンで結合
  const pattern = Array.from(KANA_TO_ROMA_MAP.keys()).concat(Array.from(SYMBOL_TO_ROMA_MAP.keys())).join("|");
  // 一回の置換操作ですべてのマッチに対応
  const regex = new RegExp(`(${pattern})`, "g");
  const processed = kanaSentence.replace(regex, "\t$1\t");

  return processed.split("\n").map((line) => {
    // タブで分割して空の要素を除去
    const splitLine = line.split("\t").filter((word) => word !== "");

    // 処理結果を格納する配列
    const result: string[] = [];

    // 各要素を処理
    for (const word of splitLine) {
      // パターンにマッチする要素ならそのまま追加
      if (KANA_TO_ROMA_MAP.has(word) || SYMBOL_TO_ROMA_MAP.has(word)) {
        result.push(word);
      } else {
        // マッチしない要素は1文字ずつ分割して追加
        for (let i = 0; i < word.length; i++) {
          result.push(word[i]);
        }
      }
    }

    return result;
  });
};

const convertZenkakuToHankaku = ({ typeChunks, char }: { typeChunks: TypeChunk[]; char: string }): string => {
  if (ZENKAKU_LIST.includes(char)) {
    char = String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  }

  const convertedZenkakuKanaChar =
    typeChunks.length > 0 && isFullWidth(typeChunks[typeChunks.length - 1]?.k)
      ? PREVIOUS_KANA_CONVERT_ZENKAKU_SYMBOLS[char as keyof typeof PREVIOUS_KANA_CONVERT_ZENKAKU_SYMBOLS]
      : undefined;

  return convertedZenkakuKanaChar || char;
};
