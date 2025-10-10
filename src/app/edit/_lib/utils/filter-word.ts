import {
  ALPHABET_LIST,
  KANA_LIST,
  LOOSE_SYMBOL_LIST,
  MANDATORY_SYMBOL_LIST,
  NUM_LIST,
  STRICT_SYMBOL_LIST,
} from "@/lib/build-map/const";

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
