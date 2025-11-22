import { CHAR_POINT } from "@/lib/build-map/build-map";
import type { Dakuten, HanDakuten, InputMode, LineWord, NormalizeHirakana } from "../../type";
import { CODE_TO_KANA, KEY_TO_KANA } from "./const";

const TYPE_CODE_SET = new Set([
  "Space",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "Minus",
  "Equal",
  "IntlYen",
  "BracketLeft",
  "BracketRight",
  "Semicolon",
  "Quote",
  "Backslash",
  "Backquote",
  "IntlBackslash",
  "Comma",
  "Period",
  "Slash",
  "IntlRo",
  "Unidentified",
]);

const TYPE_TENKEY_CODE_SET = new Set([
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "Numpad7",
  "Numpad8",
  "Numpad9",
  "Numpad0",
  "NumpadDivide",
  "NumpadMultiply",
  "NumpadSubtract",
  "NumpadAdd",
  "NumpadDecimal",
]);

export const isTypingKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.altKey) return false;
  const { keyCode, code } = event;

  const isTypeKey = (keyCode >= 65 && keyCode <= 90) || TYPE_CODE_SET.has(code) || TYPE_TENKEY_CODE_SET.has(code);
  if (!isTypeKey) return false;

  return true;
};

export const evaluateTypingKeyEvent = (event: KeyboardEvent, inputMode: InputMode, lineWord: LineWord) => {
  const typingKeys: TypingKeys = inputMode === "roma" ? romaMakeInput(event) : kanaMakeInput(event);

  const inputResult =
    inputMode === "roma" ? new RomaInput({ typingKeys, lineWord }) : new KanaInput({ typingKeys, lineWord });

  return {
    ...inputResult,
    charType: lineWord.nextChar.type,
    isCompleted: inputResult.newLineWord.nextChar.kana === "",
  };
};

// biome-ignore format: <explanation>
const KEYBOARD_CHARS = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "~", "&", "%", "!", "?", "@", "#", "$", "(", ")", "|", "{", "}", "`", "*", "+", ":", ";", "_", "<", ">", "=", "^"];
// biome-ignore format: <explanation>
const DAKU_LIST = [ "ゔ", "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ"];
const HANDAKU_KANA_LIST = ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"];

const DAKU_HANDAKU_LIST = DAKU_LIST.concat(HANDAKU_KANA_LIST);
// const yoonFlickList = ["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゃ", "ゅ", "ょ", "っ", "ゎ"];
// const yoonFlickListLarge = ["あ", "い", "う", "え", "お", "や", "ゆ", "よ", "つ", "わ"];
// const smallKanaList = ["っ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゃ", "ゅ", "ょ", "ゎ", "ヵ", "ヶ", "ん"];
// const OptimisationWhiteList = ["っっ", "っん", "っい", "っう"];

// const kana_mode_convert_rule_before = ["←", "↓", "↑", "→", "『", "』"];
// const kana_mode_convert_rule_after = ["ひだり", "した", "うえ", "みぎ", "「", "」"];

const Z_COMMAND_MAP = {
  "...": { kana: "...", romaPatterns: ["z.", "z,."], point: CHAR_POINT * 3, type: "symbol" as const },
  "..": { kana: "..", romaPatterns: ["z,"], point: CHAR_POINT * 2, type: "symbol" as const },
};

class ProcessedLineWord {
  newLineWord: LineWord;
  updatePoint: number;

  constructor({ typingKeys, lineWord }: JudgeType) {
    this.newLineWord = lineWord;
    this.updatePoint = 0;
    this.newLineWord = this.zCommand({ typingKeys, lineWord: this.newLineWord });
    this.newLineWord = this.processNNRouteKey({ typingKeys, lineWord: this.newLineWord });
  }

  private processNNRouteKey({ typingKeys, lineWord }: JudgeType) {
    const newLineWord = { ...lineWord };
    if (typingKeys.code === "KeyX" || typingKeys.code === "KeyW") {
      const expectedNextKey = typingKeys.code === "KeyX" ? "ん" : "う";
      const isNNRoute =
        newLineWord.nextChar.kana === "ん" &&
        newLineWord.correct.roma.slice(-1) === "n" &&
        newLineWord.nextChar.romaPatterns[0] === "n";
      const isNext = newLineWord.word[0]?.kana === expectedNextKey;

      if (isNNRoute && isNext && newLineWord.word[0]) {
        newLineWord.correct.kana += "ん";
        this.updatePoint = newLineWord.nextChar.point;
        newLineWord.nextChar = newLineWord.word[0];
        newLineWord.word.splice(0, 1);
        return newLineWord;
      }
    }
    return newLineWord;
  }

  private zCommand({ typingKeys, lineWord }: JudgeType) {
    const newLineWord = { ...lineWord };
    if (typingKeys.code === "KeyZ" && !typingKeys.shift) {
      const doublePeriod = newLineWord.nextChar.kana === "." && newLineWord.word[0]?.kana === ".";
      if (doublePeriod) {
        const triplePeriod = doublePeriod && newLineWord.word[1]?.kana === ".";
        if (triplePeriod) {
          newLineWord.nextChar = structuredClone(Z_COMMAND_MAP["..."]);
          newLineWord.word.splice(0, 2);
        } else {
          newLineWord.nextChar = structuredClone(Z_COMMAND_MAP[".."]);
          newLineWord.word.splice(0, 1);
        }
      }
    }
    return newLineWord;
  }
}

export interface TypingKeys {
  keys: string[];
  key: string;
  code: string;
  shift?: boolean;
}

interface JudgeType {
  typingKeys: TypingKeys;
  lineWord: LineWord;
}
export class RomaInput {
  newLineWord: LineWord;
  updatePoint: number;
  successKey: string | undefined;
  failKey: string | undefined;
  constructor({ typingKeys, lineWord }: JudgeType) {
    const processed = new ProcessedLineWord({ typingKeys, lineWord });
    this.updatePoint = processed.updatePoint;
    const result = this.hasRomaPattern(typingKeys, processed.newLineWord);
    this.newLineWord = result.newLineWord;
    this.successKey = result.successKey;
    this.failKey = result.failKey;
  }
  private hasRomaPattern(typingKeys: TypingKeys, lineWord: LineWord) {
    let newLineWord: LineWord = { ...lineWord };
    const nextRomaPattern: string[] = newLineWord.nextChar.romaPatterns;
    const kana = lineWord.nextChar.kana;
    const isSuccess = nextRomaPattern.some((pattern) => pattern[0] && pattern[0].toLowerCase() === typingKeys.keys[0]);

    if (!isSuccess || !typingKeys.keys[0]) {
      return { newLineWord, successKey: undefined, failKey: typingKeys.key };
    }

    if (kana === "ん" && newLineWord.word[0]) {
      newLineWord.word[0].romaPatterns = this.nextNNFilter(typingKeys.keys[0], newLineWord.word[0].romaPatterns);
    }

    newLineWord.nextChar.romaPatterns = this.updateNextRomaPattern(typingKeys.keys[0], nextRomaPattern);
    newLineWord = this.kanaFilter(kana, typingKeys.keys[0], newLineWord);

    newLineWord = this.wordUpdate(typingKeys.keys[0], newLineWord);

    return { newLineWord, successKey: typingKeys.keys[0] };
  }

  private updateNextRomaPattern(eventKey: TypingKeys["keys"][0], nextRomaPattern: string[]) {
    return nextRomaPattern
      .map((pattern) => (pattern.startsWith(eventKey) ? pattern.slice(1) : ""))
      .filter((pattern) => pattern !== "");
  }

  private kanaFilter(kana: string, eventKey: TypingKeys["keys"][0], newLineWord: LineWord) {
    const romaPattern = newLineWord.nextChar.romaPatterns;
    if (kana.length >= 2 && romaPattern[0]) {
      const isSokuon = kana[0] === "っ" && (eventKey === "u" || romaPattern[0][0] === eventKey);
      const isYoon = kana[0] !== "っ" && (romaPattern[0][0] === "x" || romaPattern[0][0] === "l");

      const isToriplePeriod = kana === "..." && eventKey === ",";
      if (isSokuon || isYoon) {
        newLineWord.correct.kana += newLineWord.nextChar.kana.slice(0, 1);
        newLineWord.nextChar.kana = newLineWord.nextChar.kana.slice(1);
      } else if (isToriplePeriod) {
        newLineWord.correct.kana += newLineWord.nextChar.kana.slice(0, 2);
        newLineWord.nextChar.kana = newLineWord.nextChar.kana.slice(2);
        newLineWord.nextChar.point = CHAR_POINT;
        this.updatePoint = CHAR_POINT * 2;
      }
    }

    return newLineWord;
  }

  private nextNNFilter(eventKey: TypingKeys["keys"][0], nextToNextChar: string[]) {
    const isXN = eventKey === "x" && nextToNextChar[0] && nextToNextChar[0][0] !== "n" && nextToNextChar[0][0] !== "N";

    if (isXN) {
      return nextToNextChar.filter((value: string) => {
        return value.match(/^(?!(n|')).*$/);
      });
    }

    return nextToNextChar;
  }

  private wordUpdate(eventKey: TypingKeys["key"][0], newLineWord: LineWord) {
    const kana = newLineWord.nextChar.kana;
    const romaPattern = newLineWord.nextChar.romaPatterns;

    if (!romaPattern.length) {
      newLineWord.correct.kana += kana;
      this.updatePoint = newLineWord.nextChar.point;
      newLineWord.nextChar = newLineWord.word.shift() || { kana: "", romaPatterns: [""], point: 0, type: undefined };
    }

    newLineWord.correct.roma += eventKey;

    return newLineWord;
  }
}

interface DakuHandakuData {
  type: "" | "゛" | "゜";
  normalizedKana: "" | NormalizeHirakana;
  originalKana: "" | Dakuten | HanDakuten;
}

export class KanaInput {
  newLineWord: LineWord;
  updatePoint: number;
  successKey: string | undefined;
  failKey: string | undefined;

  constructor({ typingKeys, lineWord }: JudgeType) {
    this.updatePoint = 0;
    const result = this.hasKana({ typingKeys, lineWord });
    this.newLineWord = result.newLineWord;
    this.successKey = result?.successKey;
    this.failKey = result?.failKey;
  }

  private hasKana({ typingKeys, lineWord }: JudgeType) {
    let newLineWord = { ...lineWord };

    const nextKana = lineWord.nextChar.kana;
    const firstKanaChar = nextKana.charAt(0);
    const { keys } = typingKeys;
    const isdakuHandaku = DAKU_HANDAKU_LIST.includes(firstKanaChar);

    const dakuHanDakuData: DakuHandakuData = isdakuHandaku
      ? this.parseDakuHandaku(firstKanaChar as Dakuten | HanDakuten)
      : {
          type: "",
          normalizedKana: "",
          originalKana: "",
        };

    const successIndex: number = firstKanaChar
      ? keys.indexOf(dakuHanDakuData.normalizedKana ? dakuHanDakuData.normalizedKana : firstKanaChar.toLowerCase())
      : -1;

    const typingKey =
      keys[successIndex] === "゛" || keys[successIndex] === "゜"
        ? newLineWord.nextChar.orginalDakuChar
        : keys[successIndex];

    if (!typingKey) {
      const isKanaInArray = !KEYBOARD_CHARS.includes(firstKanaChar);
      return {
        newLineWord,
        successKey: "",
        failKey: isKanaInArray ? typingKeys.keys[0] : typingKeys.key,
      };
    }

    if (dakuHanDakuData.type) {
      const yoon = nextKana.length >= 2 && dakuHanDakuData.type ? nextKana[1] : "";
      newLineWord.nextChar.kana = dakuHanDakuData.type + yoon;
      newLineWord.nextChar.orginalDakuChar = dakuHanDakuData.originalKana as Dakuten | HanDakuten;
    } else if (nextKana.length >= 2) {
      newLineWord.correct.kana += typingKey;
      newLineWord.nextChar.kana = newLineWord.nextChar.kana.slice(1);
    } else {
      newLineWord = this.wordUpdate(typingKey, newLineWord);
    }

    return { newLineWord, successKey: keys[successIndex] };
  }

  private parseDakuHandaku(originalKana: Dakuten | HanDakuten): DakuHandakuData {
    const type: "" | "゛" | "゜" = DAKU_LIST.includes(originalKana) ? "゛" : "゜";
    const normalizedKana: "" | NormalizeHirakana = originalKana.normalize("NFD")[0] as NormalizeHirakana;
    return { type, normalizedKana, originalKana };
  }

  private wordUpdate(typingKey: string, newLineWord: LineWord) {
    const romaPattern = newLineWord.nextChar.romaPatterns;

    newLineWord.correct.kana += typingKey;
    newLineWord.correct.roma += romaPattern[0];

    this.updatePoint = newLineWord.nextChar.point;
    newLineWord.nextChar = newLineWord.word.shift() || { kana: "", romaPatterns: [""], point: 0, type: undefined };

    return newLineWord;
  }
}

const romaMakeInput = (event: KeyboardEvent) => {
  const input = {
    keys: [event.key.toLowerCase()],
    key: event.key.toLowerCase(),
    code: event.code,
    shift: event.shiftKey,
  };

  return input;
};

const kanaMakeInput = (event: KeyboardEvent) => {
  const codeKanaKey = CODE_TO_KANA.get(event.code);
  const keyToKanaResult = KEY_TO_KANA.get(event.key) ?? [];
  const input = {
    keys: codeKanaKey ? [...codeKanaKey] : [...keyToKanaResult],
    key: event.key.toLowerCase(),
    code: event.code,
    shift: event.shiftKey,
  };

  if (event.keyCode === 0) {
    input.keys = ["ー", "￥", "\\"];
  } else if (event.shiftKey) {
    if (event.code === "KeyE") {
      input.keys[0] = "ぃ";
    }
    if (event.code === "KeyZ") {
      input.keys[0] = "っ";
    }

    //ATOK入力 https://support.justsystems.com/faq/1032/app/servlet/qadoc?QID=024273
    if (event.code === "KeyV") {
      input.keys.push("ゐ", "ヰ");
    }
    if (event.code === "Equal") {
      input.keys.push("ゑ", "ヱ");
    }
    if (event.code === "KeyT") {
      input.keys.push("ヵ");
    }
    if (event.code === "Quote") {
      input.keys.push("ヶ");
    }
    if (event.code === "KeyF") {
      input.keys.push("ゎ");
    }
    if (event.code === "Digit0") {
      input.keys = ["を"];
    }
  }

  if (KEYBOARD_CHARS.includes(event.key)) {
    input.keys.push(
      event.key.toLowerCase(),
      event.key.toLowerCase().replace(event.key.toLowerCase(), (s) => {
        return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
      }),
    );
  }

  return input;
};
