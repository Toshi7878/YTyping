import type { TypeChunk } from "@/app/(typing)/type/_lib/type";
import { CHAR_POINT } from "./build-map";
import { ALPHABET_LIST, NUM_LIST, ROMA_MAP, SYMBOL_TO_ROMA_MAP } from "./const";

// prettier-ignore
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

// prettier-ignore
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
// prettier-ignore
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

const generateTypingWord = (kanaChunkWord: string[]) => {
  const hasWord = !!kanaChunkWord.length;

  if (hasWord) {
    return generateTypeChunks(kanaChunkWord);
  }

  return [{ k: "", r: [""], p: 0, t: undefined }];
};

const generateTypeChunks = (kanaWordChunks: string[]) => {
  let typeChunks: TypeChunk[] = [];

  for (const kanaChunk of kanaWordChunks) {
    const romaPatterns = [
      ...(ROMA_MAP.get(kanaChunk) || SYMBOL_TO_ROMA_MAP.get(kanaChunk) || [convertZenkakuToHankaku(kanaChunk)]),
    ];

    if (!romaPatterns[0]) return typeChunks;

    typeChunks.push({
      k: kanaChunk,
      r: romaPatterns,
      p: CHAR_POINT * romaPatterns[0].length,
      t: determineCharacterType({ kanaChar: kanaChunk, romaChar: romaPatterns[0] }),
      ...(KANA_UNSUPPORTED_SYMBOLS.includes(kanaChunk) && { kanaUnSupportedSymbol: kanaChunk }),
    });

    //打鍵パターンを正規化 (促音結合 / n → nn)
    // ============================================================================================

    if (typeChunks.length >= 2) {
      const prevKanaChar = typeChunks[typeChunks.length - 2]?.k;
      const currentKanaChar = typeChunks[typeChunks.length - 1]?.k[0];

      if (prevKanaChar?.[prevKanaChar.length - 1] === "っ" && currentKanaChar) {
        if (SOKUON_JOIN_LIST.includes(currentKanaChar)) {
          typeChunks = joinSokuonPattern({ typeChunks, joinType: "normal" });
        } else if (["い", "う", "ん"].includes(currentKanaChar)) {
          typeChunks = joinSokuonPattern({ typeChunks, joinType: "iun" });
        }
      }
    }

    const prevKanaChar = typeChunks[typeChunks.length - 2]?.k ?? "";
    const currentFirstKanaChar = typeChunks[typeChunks.length - 1]?.k[0];

    if (prevKanaChar[prevKanaChar.length - 1] === "ん" && currentFirstKanaChar) {
      if (NN_LIST.includes(currentFirstKanaChar)) {
        typeChunks = replaceNWithNN(typeChunks);
      } else {
        typeChunks = applyDoubleNTypePattern(typeChunks);
      }
    }
  }

  //this.kanaArray最後の文字が「ん」だった場合も[nn]に置き換えます。
  const lastChunk = typeChunks.at(-1);
  if (lastChunk?.k === "ん") {
    lastChunk.r[0] = "nn";
    lastChunk.r.push("n'");
    lastChunk.p = CHAR_POINT * lastChunk.r[0].length;
  }

  return typeChunks;
};

const applyDoubleNTypePattern = (typeChunks: TypeChunk[]) => {
  const lastChunk = typeChunks.at(-1);
  if (!lastChunk) return typeChunks;

  const currentKanaChar = lastChunk.k;
  if (currentKanaChar) {
    //n一つのパターンでもnext typeChunkにnを追加してnnの入力を可能にする
    const currentRomaPatterns = [...lastChunk.r];

    for (const romaPattern of currentRomaPatterns) {
      lastChunk.r.push(`n${romaPattern}`);
      lastChunk.r.push(`'${romaPattern}`);
    }
  }

  return typeChunks;
};

const replaceNWithNN = (typeChunks: TypeChunk[]) => {
  const prevChunk = typeChunks.at(-2);
  if (!prevChunk) return typeChunks;

  const prevRomaPatterns = prevChunk.r;

  for (const [i, romaPattern] of prevRomaPatterns.entries()) {
    const isNNPattern =
      (romaPattern.length >= 2 &&
        romaPattern[romaPattern.length - 2] !== "x" &&
        romaPattern[romaPattern.length - 1] === "n") ||
      romaPattern === "n";

    if (isNNPattern && romaPattern) {
      prevChunk.r[i] = `${romaPattern}n`;
      prevChunk.r.push("n'");
      prevChunk.p = CHAR_POINT * romaPattern.length;
    }
  }

  return typeChunks;
};

const joinSokuonPattern = ({ joinType, typeChunks }: { joinType: "normal" | "iun"; typeChunks: TypeChunk[] }) => {
  const continuous: string[] = [];
  const xtu: string[] = [];
  const ltu: string[] = [];
  const xtsu: string[] = [];
  const ltsu: string[] = [];

  const prevChunk = typeChunks.at(-2);
  const currentChunk = typeChunks.at(-1);
  if (!prevChunk || !currentChunk) return typeChunks;

  const prevKanaChar = prevChunk.k;
  const currentKanaChar = currentChunk.k;

  currentChunk.k = prevKanaChar + currentKanaChar;
  typeChunks.splice(-2, 1);

  const sokuonLength = (prevKanaChar.match(/っ/g) || []).length;
  const lastChunk = typeChunks.at(-1);
  if (!lastChunk) return typeChunks;

  const romaPatterns = lastChunk.r;

  for (const romaPattern of romaPatterns) {
    const firstChar = romaPattern[0];
    if (firstChar && (joinType === "normal" || !["i", "u", "n"].includes(firstChar))) {
      continuous.push(firstChar.repeat(sokuonLength) + romaPattern);
    }

    xtu.push(`${"x".repeat(sokuonLength)}tu${romaPattern}`);
    ltu.push(`${"l".repeat(sokuonLength)}tu${romaPattern}`);
    xtsu.push(`${"x".repeat(sokuonLength)}tsu${romaPattern}`);
    ltsu.push(`${"l".repeat(sokuonLength)}tsu${romaPattern}`);
  }

  lastChunk.r = [...continuous, ...xtu, ...ltu, ...xtsu, ...ltsu];
  lastChunk.p = CHAR_POINT * (romaPatterns[0]?.length ?? 0);

  return typeChunks;
};

const determineCharacterType = ({ kanaChar, romaChar }: { kanaChar: string; romaChar: string }): TypeChunk["t"] => {
  if (ROMA_MAP.has(kanaChar)) {
    return "kana";
  }

  if (ALPHABET_LIST.includes(romaChar)) {
    return "alphabet";
  }

  if (NUM_LIST.includes(romaChar)) {
    return "num";
  }

  if (romaChar === " ") {
    return "space";
  }

  return "symbol";
};

const convertZenkakuToHankaku = (char: string) => {
  let convertedChar = char;
  if (ZENKAKU_LIST.includes(char)) {
    convertedChar = String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  }

  return convertedChar;
};

export { generateTypingWord };
