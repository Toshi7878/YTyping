import { LOOSE_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/app/edit/_feature/utils/const";
import { getWordConvertOption, type WordConvertOption } from "../settings/convert-option-buttons";

export const filterWordSymbol = ({
  sentence,
  filterType = "wordConvert",
  replaceChar = "",
}: {
  sentence: string;
  filterType?: "wordConvert" | "lyricsWithFilterSymbol";
  replaceChar?: string;
}) => {
  const convertOption = getWordConvertOption();
  const filterSymbolRegExp = buildFilterSymbolRegExp(convertOption);
  if (convertOption === "add_symbol_all") {
    return sentence;
  }

  //全角文字の前後のスペースをフィルター
  const zenkakuAfterSpaceReg = /([^\u0020-\u007E]) /g;
  const zenkakuBeforeSpaceReg = / ([^\u0020-\u007E])/g;

  let result = sentence.replace(filterSymbolRegExp, replaceChar);

  if (filterType === "wordConvert") {
    result = result.replaceAll(zenkakuAfterSpaceReg, "$1").replaceAll(zenkakuBeforeSpaceReg, "$1");
  }

  return result;
};

const buildFilterSymbolRegExp = (convertOption: WordConvertOption) => {
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
