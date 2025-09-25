import type { TypeChunk } from "@/app/(typing)/type/_lib/type";
import { CHAR_POINT } from "./build-map";
import { ALPHABET_LIST, NUM_LIST, ROMA_MAP, SYMBOL_TO_ROMA_MAP } from "./const";

// prettier-ignore
const ZENKAKU_LIST = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９", "Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ", "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ", "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ", "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ", "＆", "％", "！", "？", "＠", "＃", "＄", "（", "）", "｜", "｛", "｝", "｀", "＊", "＋", "：", "；", "＿", "＜", "＞", "＝", "＾", ]

// prettier-ignore
const NN_LIST = ["あ", "い", "う", "え", "お", "な", "に", "ぬ", "ね", "の", "や", "ゆ", "よ", "ん", "'", "’", "a", "i", "u", "e", "o", "y", "n", "A", "I", "U", "E", "O", "Y", "N", ];
// prettier-ignore
const SOKUON_JOIN_LIST = ["ヰ", "ゐ", "ヱ", "ゑ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゃ", "ゅ", "ょ", "っ", "ゎ", "ヵ", "ヶ", "ゔ", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "は", "ひ","ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", ]
// prettier-ignore
const KANA_UNSUPPORTED_SYMBOLS = ["←", "↓", "↑", "→"]

const generateTypingWord = (tokenizedKanaWord: string[]) => {
  const hasWord = tokenizedKanaWord.length;

  if (hasWord) {
    return generateTypeChunks(tokenizedKanaWord);
  } else {
    return [{ k: "", r: [""], p: 0, t: undefined }];
  }
};

const generateTypeChunks = (tokenizedKanaWord: string[]) => {
  let typeChunks: TypeChunk[] = [];

  for (let i = 0; i < tokenizedKanaWord.length; i++) {
    const kanaChar = tokenizedKanaWord[i];
    const romaPatterns = [
      ...(ROMA_MAP.get(kanaChar) || SYMBOL_TO_ROMA_MAP.get(kanaChar) || [convertZenkakuToHankaku(kanaChar)]),
    ];

    typeChunks.push({
      k: kanaChar,
      r: romaPatterns,
      p: CHAR_POINT * romaPatterns[0].length,
      t: determineCharacterType({ kanaChar, romaChar: romaPatterns[0] }),
      ...(KANA_UNSUPPORTED_SYMBOLS.includes(kanaChar) && { kanaUnSupportedSymbol: kanaChar }),
    });

    //打鍵パターンを正規化 (促音結合 / n → nn)
    // ============================================================================================

    if (typeChunks.length >= 2) {
      const prevKanaChar = typeChunks[typeChunks.length - 2]?.k;

      if (prevKanaChar?.[prevKanaChar.length - 1] === "っ") {
        const currentKanaChar = typeChunks[typeChunks.length - 1]["k"][0];

        if (SOKUON_JOIN_LIST.includes(currentKanaChar)) {
          typeChunks = joinSokuonPattern({ typeChunks, joinType: "normal" });
        } else if (["い", "う", "ん"].includes(currentKanaChar)) {
          typeChunks = joinSokuonPattern({ typeChunks, joinType: "iun" });
        }
      }
    }

    const prevKanaChar = typeChunks[typeChunks.length - 2]?.k ?? "";
    const currentKanaChar = typeChunks[typeChunks.length - 1].k;

    if (prevKanaChar[prevKanaChar.length - 1] === "ん") {
      if (NN_LIST.includes(currentKanaChar[0])) {
        typeChunks = replaceNWithNN(typeChunks);
      } else {
        typeChunks = applyDoubleNTypePattern(typeChunks);
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
};

const applyDoubleNTypePattern = (typeChunks: TypeChunk[]) => {
  const currentKanaChar = typeChunks[typeChunks.length - 1].k;

  if (currentKanaChar) {
    //n一つのパターンでもnext typeChunkにnを追加してnnの入力を可能にする
    const currentRomaPatterns = typeChunks[typeChunks.length - 1]["r"];
    const currentRomaPatternsLength = currentRomaPatterns.length;

    for (let i = 0; i < currentRomaPatternsLength; i++) {
      typeChunks[typeChunks.length - 1]["r"].push(`n${currentRomaPatterns[i]}`);
      typeChunks[typeChunks.length - 1]["r"].push(`'${currentRomaPatterns[i]}`);
    }
  }

  return typeChunks;
};

const replaceNWithNN = (typeChunks: TypeChunk[]) => {
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
      typeChunks[typeChunks.length - 2]["r"][i] = `${prevRomaPatterns[i]}n`;
      typeChunks[typeChunks.length - 2]["r"].push("n'");
      typeChunks[typeChunks.length - 2]["p"] = CHAR_POINT * prevRomaPatterns[i].length;
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

    xtu.push(`${"x".repeat(sokuonLength)}tu${romaPatterns[i]}`);
    ltu.push(`${"l".repeat(sokuonLength)}tu${romaPatterns[i]}`);
    xtsu.push(`${"x".repeat(sokuonLength)}tsu${romaPatterns[i]}`);
    ltsu.push(`${"l".repeat(sokuonLength)}tsu${romaPatterns[i]}`);
  }

  typeChunks[typeChunks.length - 1]["r"] = [...continuous, ...xtu, ...ltu, ...xtsu, ...ltsu];
  typeChunks[typeChunks.length - 1]["p"] = CHAR_POINT * romaPatterns[0].length;

  return typeChunks;
};

const determineCharacterType = ({ kanaChar, romaChar }: { kanaChar: string; romaChar: string }): TypeChunk["t"] => {
  if (ROMA_MAP.has(kanaChar)) {
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
};

const convertZenkakuToHankaku = (char: string) => {
  if (ZENKAKU_LIST.includes(char)) {
    char = String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  }

  return char;
};

export { generateTypingWord };
