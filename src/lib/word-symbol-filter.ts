import { LOOSE_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/app/edit/_lib/const";
import type { WordSymbolFilterOption } from "@/validator/morph/tokenize";

const buildFilterSymbolRegExp = (convertOption: WordSymbolFilterOption) => {
  if (convertOption === "non_symbol") {
    const filterChars = [...LOOSE_SYMBOL_LIST, ...STRICT_SYMBOL_LIST]
      .map((s) => s.replaceAll(/./g, String.raw`\$&`))
      .join("");

    return new RegExp(`[${filterChars}]`, "g");
  }

  if (convertOption === "add_symbol") {
    const filterChars = STRICT_SYMBOL_LIST.map((s) => s.replaceAll(/./g, String.raw`\$&`)).join("");

    return new RegExp(`[${filterChars}]`, "g");
  }

  return /(?:)/;
};

/**
 * エディタの読み変換と同じ記号・全角周りの整形（typable-word-convert の filterWordSymbol 相当）
 * 改行（\\n / \\r）は記号除去・全角前後スペース除去の対象にしない。
 */
export function applyWordSymbolFilter({
  sentence,
  option,
  replaceChar = "",
}: {
  sentence: string;
  option: WordSymbolFilterOption;
  replaceChar?: string;
}): string {
  if (option === "add_symbol_all") {
    return sentence;
  }

  const filterSymbolRegExp = buildFilterSymbolRegExp(option);

  const zenkakuAfterSpaceReg = /([^\u0020-\u007E]) /g;
  const zenkakuBeforeSpaceReg = / ([^\u0020-\u007E])/g;

  let result = sentence
    .split("\n")
    .map((segment) => segment.replace(filterSymbolRegExp, replaceChar))
    .join("\n");

  result = result.replaceAll(zenkakuAfterSpaceReg, "$1").replaceAll(zenkakuBeforeSpaceReg, "$1");

  return result;
}
