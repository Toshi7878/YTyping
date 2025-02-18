import { CODE_TO_KANA, KEY_TO_KANA } from "../../../../../../config/consts/kanaKeyMap";
import { CHAR_POINT } from "../../../../../../lib/instanceMapData";
import {
  Dakuten,
  HanDakuten,
  InputModeType,
  LineWord,
  NormalizeHirakana,
  TypeChunk,
} from "../../../type";

const keyboardCharacters = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "~",
  "&",
  "%",
  "!",
  "?",
  "@",
  "#",
  "$",
  "(",
  ")",
  "|",
  "{",
  "}",
  "`",
  "*",
  "+",
  ":",
  ";",
  "_",
  "<",
  ">",
  "=",
  "^",
];

const dakuKanaList = [
  "ゔ",
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
];
const handakuKanaList = ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"];

const dakuHandakuList = dakuKanaList.concat(handakuKanaList);
const yoonFlickList = ["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゃ", "ゅ", "ょ", "っ", "ゎ"];
const yoonFlickListLarge = ["あ", "い", "う", "え", "お", "や", "ゆ", "よ", "つ", "わ"];
const smallKanaList = [
  "っ",
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
  "ゃ",
  "ゅ",
  "ょ",
  "ゎ",
  "ヵ",
  "ヶ",
  "ん",
];
const OptimisationWhiteList = ["っっ", "っん", "っい", "っう"];

const kana_mode_convert_rule_before = ["←", "↓", "↑", "→", "『", "』"];
const kana_mode_convert_rule_after = ["ひだり", "した", "うえ", "みぎ", "「", "」"];

const Z_COMMAND_MAP = {
  "...": { k: "...", r: ["z.", "z,."], p: CHAR_POINT * 3, t: "symbol" as const },
  "..": { k: "..", r: ["z,"], p: CHAR_POINT * 2, t: "symbol" as const },
};

interface JudgeType {
  typingKeys: TypingKeys;
  lineWord: LineWord;
}

export interface TypingKeys {
  keys: string[];
  key: string;
  code: string;
  shift?: boolean;
}

class ProcessedLineWord {
  newLineWord: LineWord;
  updatePoint: number;

  constructor({ typingKeys, lineWord }: JudgeType) {
    this.newLineWord = lineWord;
    this.updatePoint = 0;
    this.newLineWord = this.zCommand({ typingKeys, lineWord: this.newLineWord });
    this.newLineWord = this.keyW({ typingKeys, lineWord: this.newLineWord });
    this.newLineWord = this.keyX({ typingKeys, lineWord: this.newLineWord });
  }

  private keyX({ typingKeys, lineWord }: JudgeType) {
    if (typingKeys.code === "KeyX") {
      // 「んん」: nxn の対応
      const isNNRoute =
        lineWord.nextChar.k === "ん" &&
        lineWord.correct.r.slice(-1) === "n" &&
        lineWord.nextChar.r[0] === "n";
      const isNextXN = lineWord.word[0]?.k === "ん";
      if (isNNRoute && isNextXN) {
        lineWord.correct.k += "ん";
        this.updatePoint = lineWord.nextChar.p;
        lineWord.nextChar = lineWord.word[0];
        lineWord.word.splice(0, 1);
      }
    }
    return lineWord;
  }

  private keyW({ typingKeys, lineWord }: JudgeType) {
    if (typingKeys.code === "KeyW") {
      const isNNRoute =
        lineWord.nextChar.k === "ん" &&
        lineWord.correct.r.slice(-1) === "n" &&
        lineWord.nextChar.r[0] === "n";
      const isNextWuWhu = lineWord.word[0]?.k === "う";
      if (isNNRoute && isNextWuWhu) {
        lineWord.correct.k += "ん";
        this.updatePoint = lineWord.nextChar.p;
        lineWord.nextChar = lineWord.word[0];
        lineWord.word.splice(0, 1);
      }
    }
    return lineWord;
  }

  private zCommand({ typingKeys, lineWord }: JudgeType) {
    if (typingKeys.code === "KeyZ" && !typingKeys.shift) {
      const doublePeriod = lineWord.nextChar.k === "." && lineWord.word[0]?.k === ".";
      if (doublePeriod) {
        const triplePeriod = lineWord.word[1]?.k === ".";
        if (triplePeriod) {
          // オブジェクトは浅いコピーで作成（structuredClone の代わり）
          lineWord.nextChar = { ...Z_COMMAND_MAP["..."] };
          lineWord.word.splice(0, 2);
        } else {
          lineWord.nextChar = { ...Z_COMMAND_MAP[".."] };
          lineWord.word.splice(0, 1);
        }
      }
    }
    return lineWord;
  }
}

/**
 * RomaInput クラス
 */
export class RomaInput {
  newLineWord: LineWord;
  updatePoint: number;
  successKey: string;
  failKey: string;

  constructor({ typingKeys, lineWord }: JudgeType) {
    const processed = new ProcessedLineWord({ typingKeys, lineWord });
    this.updatePoint = processed.updatePoint;
    const result = this.hasRomaPattern(typingKeys, processed.newLineWord);
    this.newLineWord = result.newLineWord as LineWord;
    this.successKey = result.successKey;
    this.failKey = result.failKey ?? "";
  }

  private hasRomaPattern(typingKeys: TypingKeys, lineWord: LineWord) {
    const newLineWord = lineWord;
    const nextRomaPattern: string[] = newLineWord.nextChar["r"];
    const kana = newLineWord.nextChar["k"];
    const isSuccess = nextRomaPattern.some(
      (pattern) => pattern[0] && pattern[0].toLowerCase() === typingKeys.keys[0]
    );

    if (!isSuccess) {
      return { newLineWord, successKey: "", failKey: typingKeys.key };
    }

    if (kana === "ん" && newLineWord.word[0]) {
      newLineWord.word[0]["r"] = this.nextNNFilter(typingKeys.keys[0], newLineWord);
    }

    newLineWord.nextChar["r"] = this.updateNextRomaPattern(typingKeys, nextRomaPattern);
    this.kanaFilter(kana, typingKeys.keys[0], nextRomaPattern, newLineWord);
    this.wordUpdate(typingKeys, newLineWord);

    return { newLineWord, successKey: typingKeys.keys[0] };
  }

  private updateNextRomaPattern(typingKeys: TypingKeys, nextRomaPattern: string[]) {
    const key = typingKeys.keys[0];
    return nextRomaPattern
      .map((pattern) => (pattern.startsWith(key) ? pattern.slice(1) : ""))
      .filter((pattern) => pattern !== "");
  }

  private kanaFilter(
    kana: string,
    typingKey: string,
    romaPattern: string[],
    newLineWord: LineWord
  ) {
    if (kana.length >= 2 && romaPattern.length) {
      const isSokuonYouon =
        (kana[0] !== "っ" && (romaPattern[0][0] === "x" || romaPattern[0][0] === "l")) ||
        (kana[0] === "っ" && (typingKey === "u" || romaPattern[0][0] === typingKey));

      const isToriplePeriod = kana === "..." && typingKey === ",";
      if (isSokuonYouon) {
        newLineWord.correct["k"] += newLineWord.nextChar["k"].slice(0, 1);
        newLineWord.nextChar["k"] = newLineWord.nextChar["k"].slice(1);
      } else if (isToriplePeriod) {
        newLineWord.correct["k"] += newLineWord.nextChar["k"].slice(0, 2);
        newLineWord.nextChar["k"] = newLineWord.nextChar["k"].slice(2);
        newLineWord.nextChar["p"] = CHAR_POINT;
        this.updatePoint = CHAR_POINT * 2;
      }
    }

    return newLineWord;
  }

  // xn で「ん」を打鍵する場合、次の文字から [nn, n'] の打鍵パターンを除外
  private nextNNFilter(typingKey: string, newLineWord: LineWord) {
    const nextToNextChar = newLineWord.word[0]["r"];
    const isXN =
      typingKey === "x" &&
      nextToNextChar[0] &&
      nextToNextChar[0][0] !== "n" &&
      nextToNextChar[0][0] !== "N";

    if (isXN) {
      return nextToNextChar.filter((value: string) => !value.match(/^(n|').*$/));
    } else {
      return nextToNextChar;
    }
  }

  private wordUpdate(typingKeys: TypingKeys, newLineWord: LineWord) {
    const kana = newLineWord.nextChar["k"];
    const romaPattern = newLineWord.nextChar["r"];
    // チャンク打ち切り
    if (!romaPattern.length) {
      newLineWord.correct["k"] += kana;
      this.updatePoint = newLineWord.nextChar["p"];
      newLineWord.nextChar = newLineWord.word.shift() || { k: "", r: [""], p: 0, t: undefined };
    }
    newLineWord.correct["r"] += typingKeys.keys[0];
    return newLineWord;
  }
}

export class KanaInput {
  newLineWord: LineWord;
  updatePoint: number;
  successKey: string;
  failKey: string;

  constructor({ typingKeys, lineWord }: JudgeType) {
    this.updatePoint = 0;
    const result = this.hasKana({ typingKeys, lineWord });
    this.newLineWord = result.newLineWord as LineWord;
    this.successKey = result.successKey;
    this.failKey = result.failKey ?? "";
  }

  private hasKana({ typingKeys, lineWord }: JudgeType) {
    let newLineWord = lineWord;
    const nextKana = lineWord.nextChar["k"];
    const keys = typingKeys.keys;
    const isdakuHandaku = dakuHandakuList.includes(nextKana[0]);

    const dakuHanDakuData: {
      type: "" | "゛" | "゜";
      normalized: "" | NormalizeHirakana;
      dakuHandaku: "" | Dakuten | HanDakuten;
    } = isdakuHandaku
      ? this.parseDakuHandaku(nextKana[0] as Dakuten | HanDakuten)
      : { type: "", normalized: "", dakuHandaku: "" };

    const successIndex: number = nextKana[0]
      ? keys.indexOf(
          dakuHanDakuData.normalized ? dakuHanDakuData.normalized : nextKana[0].toLowerCase()
        )
      : -1;

    const typingKey =
      keys[successIndex] === "゛" || keys[successIndex] === "゜"
        ? newLineWord.kanaDakuten
        : keys[successIndex];

    if (!typingKey) {
      const isKanaInArray = !keyboardCharacters.includes(nextKana[0]);
      return {
        newLineWord,
        successKey: "",
        failKey: isKanaInArray ? typingKeys.keys[0] : typingKeys.key,
      };
    }

    if (dakuHanDakuData.type) {
      const yoon = nextKana.length >= 2 ? nextKana[1] : "";
      newLineWord.nextChar["k"] = dakuHanDakuData.type + yoon;
      newLineWord.kanaDakuten = dakuHanDakuData.dakuHandaku;
    } else {
      if (nextKana.length >= 2) {
        newLineWord.correct["k"] += typingKey;
        newLineWord.nextChar["k"] = newLineWord.nextChar["k"].slice(1);
      } else {
        newLineWord = this.wordUpdate(typingKey, newLineWord);
      }
    }

    return { newLineWord, successKey: keys[successIndex] };
  }

  private parseDakuHandaku(dakuHandaku: Dakuten | HanDakuten): {
    type: "" | "゛" | "゜";
    normalized: "" | NormalizeHirakana;
    dakuHandaku: "" | Dakuten | HanDakuten;
  } {
    const type: "" | "゛" | "゜" = dakuKanaList.includes(dakuHandaku) ? "゛" : "゜";
    const normalized: "" | NormalizeHirakana = dakuHandaku.normalize("NFD")[0] as NormalizeHirakana;
    return { type, normalized, dakuHandaku };
  }

  private wordUpdate(typingKey: string, newLineWord: LineWord) {
    const romaPattern = newLineWord.nextChar["r"];
    newLineWord.correct["k"] += typingKey;
    newLineWord.correct["r"] += romaPattern[0];
    this.updatePoint = newLineWord.nextChar["p"];
    newLineWord.nextChar = newLineWord.word.shift() || { k: "", r: [""], p: 0, t: undefined };
    return newLineWord;
  }
}

interface TypingEvent {
  event: KeyboardEvent;
  lineWord: LineWord;
  inputMode?: InputModeType;
}

export class Typing {
  typeChunk: TypeChunk;
  newLineWord: LineWord;
  updatePoint: number;
  successKey: string;
  failKey: string;

  constructor({ event, lineWord, inputMode }: TypingEvent) {
    const typingKeys: TypingKeys =
      inputMode === "roma" ? this.romaMakeInput(event) : this.kanaMakeInput(event);
    const inputResult =
      inputMode === "roma"
        ? new RomaInput({ typingKeys, lineWord })
        : new KanaInput({ typingKeys, lineWord });

    this.typeChunk = lineWord.nextChar;
    this.newLineWord = inputResult.newLineWord;
    this.updatePoint = inputResult.updatePoint;
    this.successKey = inputResult.successKey;
    this.failKey = inputResult.failKey;
  }

  private romaMakeInput(event: KeyboardEvent) {
    const input = {
      keys: [event.key.toLowerCase()],
      key: event.key.toLowerCase(),
      code: event.code,
      shift: event.shiftKey,
    };
    return input;
  }

  private kanaMakeInput(event: KeyboardEvent) {
    const input = {
      keys: CODE_TO_KANA[event.code] ? CODE_TO_KANA[event.code] : KEY_TO_KANA[event.key],
      key: event.key.toLowerCase(),
      code: event.code,
      shift: event.shiftKey,
    };

    if (event.keyCode === 0) {
      input.keys = ["ー", "￥", "\\"];
    }
    if (event.shiftKey) {
      if (event.code == "KeyE") {
        input.keys[0] = "ぃ";
      }
      if (event.code == "KeyZ") {
        input.keys[0] = "っ";
      }
      // ATOK入力対応
      if (event.code == "KeyV") {
        input.keys.push("ゐ", "ヰ");
      }
      if (event.code == "Equal") {
        input.keys.push("ゑ", "ヱ");
      }
      if (event.code == "KeyT") {
        input.keys.push("ヵ");
      }
      if (event.code == "Quote") {
        input.keys.push("ヶ");
      }
      if (event.code == "KeyF") {
        input.keys.push("ゎ");
      }
      if (event.key == "0") {
        input.keys = ["を"];
      }
    }
    if (keyboardCharacters.includes(event.key)) {
      input.keys.push(
        event.key.toLowerCase(),
        event.key.toLowerCase().replace(event.key.toLowerCase(), function (s) {
          return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
        })
      );
    }
    return input;
  }
}
