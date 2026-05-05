import { LOOSE_SYMBOL_LIST, MANDATORY_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/app/edit/_lib/const";
// biome-ignore format:<>
export const ALPHABET_LIST = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
// biome-ignore format:<>
export const NUM_LIST = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
// biome-ignore format:<>
export const KANA_LIST = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん", "ゔ", "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "っ", "ゃ", "ゅ", "ょ", "ゎ", "ゐ", "ゑ"]

const typableWordChars = new Set([
  ...KANA_LIST,
  ...ALPHABET_LIST,
  ...MANDATORY_SYMBOL_LIST,
  ...LOOSE_SYMBOL_LIST,
  ...STRICT_SYMBOL_LIST,
  ...NUM_LIST,
]);

export const filterToTypableWordChars = (text: string): string => {
  return [...text].filter((char) => typableWordChars.has(char)).join("");
};

export const sanitizeToAllowedSymbols = (text: string): string => {
  const allowedSymbols = new Set([...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST, ...STRICT_SYMBOL_LIST]);

  return text.replaceAll(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{ASCII}\d\s]/gu, (char) =>
    allowedSymbols.has(char) ? char : "",
  );
};
