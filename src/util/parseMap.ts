import { ALPHABET_LIST, NUM_LIST } from "@/config/consts/charList";
import { MapLine } from "@/types/map";
import { InputMode, LineData, LineResultData, LineWord, TypeChunk } from "../app/type/ts/type";
import { ROMA_MAP } from "../config/consts/romaMap";

const ZENKAKU_LIST = [
  "０",
  "１",
  "２",
  "３",
  "４",
  "５",
  "６",
  "７",
  "８",
  "９",
  "Ａ",
  "Ｂ",
  "Ｃ",
  "Ｄ",
  "Ｅ",
  "Ｆ",
  "Ｇ",
  "Ｈ",
  "Ｉ",
  "Ｊ",
  "Ｋ",
  "Ｌ",
  "Ｍ",
  "Ｎ",
  "Ｏ",
  "Ｐ",
  "Ｑ",
  "Ｒ",
  "Ｓ",
  "Ｔ",
  "Ｕ",
  "Ｖ",
  "Ｗ",
  "Ｘ",
  "Ｙ",
  "Ｚ",
  "ａ",
  "ｂ",
  "ｃ",
  "ｄ",
  "ｅ",
  "ｆ",
  "ｇ",
  "ｈ",
  "ｉ",
  "ｊ",
  "ｋ",
  "ｌ",
  "ｍ",
  "ｎ",
  "ｏ",
  "ｐ",
  "ｑ",
  "ｒ",
  "ｓ",
  "ｔ",
  "ｕ",
  "ｖ",
  "ｗ",
  "ｘ",
  "ｙ",
  "ｚ",
  "～",
  "＆",
  "％",
  "！",
  "？",
  "＠",
  "＃",
  "＄",
  "（",
  "）",
  "｜",
  "｛",
  "｝",
  "｀",
  "＊",
  "＋",
  "：",
  "；",
  "＿",
  "＜",
  "＞",
  "＝",
  "＾",
];
const NN_LIST = [
  "あ",
  "い",
  "う",
  "え",
  "お",
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "や",
  "ゆ",
  "よ",
  "ん",
  "'",
  "’",
  "a",
  "i",
  "u",
  "e",
  "o",
  "y",
  "n",
  "A",
  "I",
  "U",
  "E",
  "O",
  "Y",
  "N",
];

const SOKUON_JOIN_LIST = [
  "ヰ",
  "ゐ",
  "ヱ",
  "ゑ",
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
  "ゃ",
  "ゅ",
  "ょ",
  "っ",
  "ゎ",
  "ヵ",
  "ヶ",
  "ゔ",
  "か",
  "き",
  "く",
  "け",
  "こ",
  "さ",
  "し",
  "す",
  "せ",
  "そ",
  "た",
  "ち",
  "つ",
  "て",
  "と",
  "は",
  "ひ",
  "ふ",
  "へ",
  "ほ",
  "ま",
  "み",
  "む",
  "め",
  "も",
  "や",
  "ゆ",
  "よ",
  "ら",
  "り",
  "る",
  "れ",
  "ろ",
  "わ",
  "を",
  "が",
  "ぎ",
  "ぐ",
  "げ",
  "ご",
  "ざ",
  "じ",
  "ず",
  "ぜ",
  "ぞ",
  "だ",
  "ぢ",
  "づ",
  "で",
  "ど",
  "ば",
  "び",
  "ぶ",
  "べ",
  "ぼ",
  "ぱ",
  "ぴ",
  "ぷ",
  "ぺ",
  "ぽ",
];

const KANA_UNSUPPORTED_SYMBOLS = ["←", "↓", "↑", "→"];

const PREVIOUS_KANA_CONVERT_ZENKAKU_SYMBOLS = {
  "!": "！",
  "?": "？",
};

export const CHAR_POINT = 50;
export const MISS_PENALTY = CHAR_POINT / 2;

export class TypingWord {
  word: LineData["word"];

  constructor(lineRomaMap: [string, ...string[]]) {
    this.word = this.hiraganaToRomaArray(lineRomaMap);
  }

  private getCharType({ romaChar, romaMapIndex }: { romaChar: string; romaMapIndex?: number }): TypeChunk["t"] {
    if (romaMapIndex && romaMapIndex >= 10 && romaMapIndex <= 222) {
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

  private hiraganaToRomaArray(lineRomaMap: [string, ...string[]]) {
    let word: TypeChunk[] = [];
    const STR_LEN = lineRomaMap.length;

    for (let i = 0; i < STR_LEN; i++) {
      const romaMapIndex = parseInt(lineRomaMap[i]);
      const CHAR = structuredClone(ROMA_MAP[romaMapIndex]);
      if (CHAR) {
        word = this.pushRomaMapChar({ word, CHAR, romaMapIndex });
      } else {
        for (let v = 0; v < lineRomaMap[i].length; v++) {
          word = this.pushChar({ word, char: lineRomaMap[i][v], index: v });
        }
      }
    }

    //this.kanaArray最後の文字が「ん」だった場合も[nn]に置き換えます。
    if (word[word.length - 1]["k"] == "ん") {
      word[word.length - 1]["r"][0] = "nn";
      word[word.length - 1]["r"].push("n'");
      word[word.length - 1]["p"] = CHAR_POINT * word[word.length - 1]["r"][0].length;
    }

    return word;
  }

  private pushRomaMapChar({
    word,
    CHAR,
    romaMapIndex,
  }: {
    word: TypeChunk[];
    CHAR: (typeof ROMA_MAP)[number];
    romaMapIndex: number;
  }) {
    word.push({
      ...CHAR,
      p: CHAR_POINT * CHAR["r"][0].length,
      t: this.getCharType({ romaChar: CHAR.r[0], romaMapIndex }),
      ...(KANA_UNSUPPORTED_SYMBOLS.includes(CHAR.k) && { kanaUnSupportedSymbol: CHAR.k }),
    });

    //促音の打鍵パターン
    if (word.length >= 2) {
      const PREVIOUS_KANA = word[word.length - 2]["k"];

      if (PREVIOUS_KANA && PREVIOUS_KANA[PREVIOUS_KANA.length - 1] == "っ") {
        const KANA = word[word.length - 1]["k"][0];

        if (SOKUON_JOIN_LIST.includes(KANA)) {
          word = this.joinSokuonPattern("", word);
        } else if (["い", "う", "ん"].includes(KANA)) {
          word = this.joinSokuonPattern("iunFlag", word);
        }
      }
    }

    //n→nn変換
    word = this.nConvert_nn(word);

    return word;
  }

  private pushChar({ word, char, index }: { word: TypeChunk[]; char: string; index: number }) {
    //全角→半角に変換(英数字記号)
    if (ZENKAKU_LIST.includes(char)) {
      char = String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    }

    const convertedKanaChar =
      word.length > 0 && isFullWidth(word[word.length - 1]?.k)
        ? PREVIOUS_KANA_CONVERT_ZENKAKU_SYMBOLS[char as keyof typeof PREVIOUS_KANA_CONVERT_ZENKAKU_SYMBOLS]
        : undefined;

    //追加
    word.push({
      k: convertedKanaChar || char,
      r: [char],
      p: CHAR_POINT * char.length,
      t: this.getCharType({ romaChar: char }),
    });

    //n→nn変換
    if (index === 0) {
      word = this.nConvert_nn(word);
    }

    return word;
  }

  //'っ','か' → 'っか'等の繋げられる促音をつなげる
  private joinSokuonPattern(iunFlag: string, lineWord: { k: string; r: string[]; p: number; t: TypeChunk["t"] }[]) {
    const PREVIOUS_KANA = lineWord[lineWord.length - 2]["k"];
    const KANA = lineWord[lineWord.length - 1]["k"];

    lineWord[lineWord.length - 1]["k"] = PREVIOUS_KANA + KANA;
    lineWord.splice(-2, 1);

    let repeat: string[] = [];
    let xtu: string[] = [];
    let ltu: string[] = [];
    let xtsu: string[] = [];
    let ltsu: string[] = [];

    const XTU_LEN = (PREVIOUS_KANA.match(/っ/g) || []).length;
    const ROMA_LEN = lineWord[lineWord.length - 1]["r"].length;
    //変数に値渡し？して処理する方がわかりやすい(後でリファクタリング)
    for (let i = 0; i < ROMA_LEN; i++) {
      if (!iunFlag || !["i", "u", "n"].includes(lineWord[lineWord.length - 1]["r"][i][0])) {
        repeat.push(lineWord[lineWord.length - 1]["r"][i][0].repeat(XTU_LEN) + lineWord[lineWord.length - 1]["r"][i]);
      }

      xtu.push("x".repeat(XTU_LEN) + "tu" + lineWord[lineWord.length - 1]["r"][i]);
      ltu.push("l".repeat(XTU_LEN) + "tu" + lineWord[lineWord.length - 1]["r"][i]);
      xtsu.push("x".repeat(XTU_LEN) + "tsu" + lineWord[lineWord.length - 1]["r"][i]);
      ltsu.push("l".repeat(XTU_LEN) + "tsu" + lineWord[lineWord.length - 1]["r"][i]);
    }

    lineWord[lineWord.length - 1]["r"] = [...repeat, ...xtu, ...ltu, ...xtsu, ...ltsu];
    lineWord[lineWord.length - 1]["p"] = CHAR_POINT * lineWord[lineWord.length - 1]["r"][0].length;

    return lineWord;
  }

  private nConvert_nn(lineWord: TypeChunk[]) {
    //n→nn変換
    const PREVIOUS_KANA = lineWord.length >= 2 ? lineWord[lineWord.length - 2]["k"] : false;

    if (PREVIOUS_KANA && PREVIOUS_KANA[PREVIOUS_KANA.length - 1] == "ん") {
      if (NN_LIST.includes(lineWord[lineWord.length - 1]["k"])) {
        for (let i = 0; i < lineWord[lineWord.length - 2]["r"].length; i++) {
          const ROMA_PATTERN = lineWord[lineWord.length - 2]["r"][i];
          const IS_N =
            (ROMA_PATTERN.length >= 2 &&
              ROMA_PATTERN[ROMA_PATTERN.length - 2] != "x" &&
              ROMA_PATTERN[ROMA_PATTERN.length - 1] == "n") ||
            ROMA_PATTERN == "n";

          if (IS_N) {
            lineWord[lineWord.length - 2]["r"][i] = lineWord[lineWord.length - 2]["r"][i] + "n";
            lineWord[lineWord.length - 2]["r"].push("n'");
            lineWord[lineWord.length - 2]["p"] = CHAR_POINT * lineWord[lineWord.length - 2]["r"][i].length;
          }
        }

        //それ以外の文字でもnnの入力を可能にする
      } else if (lineWord[lineWord.length - 1]["k"]) {
        const ROMA_PATTERN_LEN = lineWord[lineWord.length - 1]["r"].length;

        for (let i = 0; i < ROMA_PATTERN_LEN; i++) {
          lineWord[lineWord.length - 1]["r"].push("n" + lineWord[lineWord.length - 1]["r"][i]);
          lineWord[lineWord.length - 1]["r"].push("'" + lineWord[lineWord.length - 1]["r"][i]);
        }
      }
    }

    return lineWord;
  }
}

export class ParseMap {
  mapData: LineData[];

  startLine: number;
  lineLength: number;
  typingLineIndexes: number[];
  mapChangeCSSCounts: number[];
  defaultLineResultData: LineResultData[];
  totalNotes: LineData["notes"];
  speedDifficulty: { median: { r: number; k: number }; max: { r: number; k: number } };
  movieTotalTime: number;
  keyRate: number;
  missRate: number;

  constructor(data: MapLine[]) {
    const wordRomaMap = this.parseWord(data);

    const result = this.create(wordRomaMap, data);

    this.mapData = result.words;
    this.startLine = result.startLine;

    this.lineLength = result.lineLength;
    this.typingLineIndexes = result.typingLineIndexes;
    this.mapChangeCSSCounts = result.mapChangeCSSCounts;

    this.defaultLineResultData = result.defaultLineResultData;
    this.totalNotes = this.calculateTotalNotes(result.words);
    this.speedDifficulty = this.calculateSpeedDifficulty(result.words);

    this.movieTotalTime = +this.mapData[result.words.length - 1].time;
    this.keyRate = 100 / this.totalNotes.r;
    this.missRate = this.keyRate / 2;
  }

  private create(wordRomaMap: string[][], data: MapLine[]) {
    const mapData: LineData[] = [];
    const defaultLineResultData: LineResultData[] = [];
    const typingLineIndexes: number[] = [];
    const mapChangeCSSCounts: number[] = [];
    const inputMode = (localStorage.getItem("inputMode") ?? "roma") as InputMode;
    const validatedInputMode = ["roma", "kana", "flick"].includes(inputMode) ? inputMode : "roma";
    let startLine = 0;
    let lineLength = 0;
    for (let i = 0; i < data.length; i++) {
      const time = data[i]["time"];
      const lyrics = data[i]["lyrics"];
      const options = data[i]["options"];

      if (options?.isChangeCSS) {
        mapChangeCSSCounts.push(i);
      }
      if (wordRomaMap[i].length && lyrics !== "end") {
        if (startLine == 0) {
          startLine = i;
        }
        lineLength++;
        typingLineIndexes.push(i);
        const remainTime = Number(data[i + 1]["time"]) - Number(time);
        const createLineWord = new TypingWord(wordRomaMap[i] as [string, ...string[]]);

        const word: LineData["word"] = createLineWord.word;
        const notes: LineData["notes"] = this.calcLineNotes(word);
        const kpm: LineData["kpm"] = this.calcLineKpm(notes, remainTime);
        mapData.push({
          time: Number(time),
          lyrics,
          word,
          kpm,
          notes,
          kanaWord: word.map((w) => w["k"]).join(""),
          lineCount: lineLength,
          options,
        });

        defaultLineResultData.push({
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
        mapData.push({
          time: Number(time),
          lyrics,
          word: [{ k: "", r: [""], p: 0, t: undefined }],
          kanaWord: "",
          kpm: { k: 0, r: 0 },
          notes: { k: 0, r: 0 },
          options,
        });

        defaultLineResultData.push({
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
      words: mapData,
      startLine,
      lineLength,
      defaultLineResultData,
      typingLineIndexes: typingLineIndexes,
      mapChangeCSSCounts,
    };
  }

  private calcLineKpm(notes: LineData["notes"], remainTime: number) {
    const romaKpm = Math.round((notes.r / remainTime) * 60);
    const kanaKpm = Math.round((notes.k / remainTime) * 60);
    return { r: romaKpm, k: kanaKpm };
  }

  private calcLineNotes(word: TypeChunk[]) {
    const kanaWord = word.map((item) => item.k);
    const dakuHandakuLineNotes = (
      kanaWord.join("").match(/[ゔ|が|ぎ|ぐ|げ|ご|ざ|じ|ず|ぜ|ぞ|だ|ぢ|づ|で|ど|ば|び|ぶ|べ|ぼ|ぱ|ぴ|ぷ|ぺ|ぽ]/g) || []
    ).length;
    const kanaNotes = kanaWord.join("").length + dakuHandakuLineNotes;

    const romaWord = word.map((item) => item.r[0]);

    return { k: kanaNotes, r: romaWord.join("").length };
  }

  private parseWord(data: MapLine[]) {
    let lyrics = data
      .map((line) => line["word"].trim())
      .join("\n")
      .replace(/…/g, "...")
      .replace(/‥/g, "..")
      .replace(/･/g, "・")
      .replace(/〜/g, "～")
      .replace(/｢/g, "「")
      .replace(/｣/g, "」")
      .replace(/､/g, "、")
      .replace(/｡/g, "。")
      .replace(/　/g, " ")
      .replace(/ {2,}/g, " ")
      .replace(/ヴ/g, "ゔ")
      .replace(/－/g, "ー");

    const ROMA_MAP_LEN = ROMA_MAP.length;

    for (let i = 0; i < ROMA_MAP_LEN; i++) {
      lyrics = lyrics.replace(RegExp(ROMA_MAP[i]["k"], "g"), "\t" + i + "\t");
    }

    const lyricsArray = lyrics.split("\n");

    return lyricsArray.map((array) => array.split("\t").filter((word) => word > ""));
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

    const romaMedianSpeed = this.median(romaSpeedList);
    const kanaMedianSpeed = this.median(kanaSpeedList);
    const romaMaxSpeed = Math.max(...romaSpeedList);
    const kanaMaxSpeed = Math.max(...kanaSpeedList);

    return {
      median: { r: romaMedianSpeed, k: kanaMedianSpeed },
      max: { r: romaMaxSpeed, k: kanaMaxSpeed },
    };
  }

  private median(arr) {
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
}

export function romaConvert(lineWord: LineWord) {
  const dakuten = lineWord.nextChar.orginalDakuChar;
  let kanaWord = (dakuten ? dakuten : lineWord.nextChar["k"]) + lineWord.word.map((char) => char["k"]).join("");
  const nextPoint = lineWord.nextChar["p"];
  const ROMA_MAP_LEN = ROMA_MAP.length;

  for (let i = 0; i < ROMA_MAP_LEN; i++) {
    kanaWord = kanaWord.replace(RegExp(ROMA_MAP[i]["k"], "g"), "\t" + i + "\t");
  }

  const lyricsArray = kanaWord.split("\t").filter((word) => word > "");
  const word = new TypingWord(lyricsArray as [string, ...string[]]).word;

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
