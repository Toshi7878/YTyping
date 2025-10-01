import { normalizeSymbols } from "@/utils/string-transform";
import { useReadImeTypeOptions } from "../atoms/state-atoms";

const REGEX_LIST = ["^-ぁ-んゔ", "ァ-ンヴ", "一-龥", "\\w", "\\d", " ", "々%&@&=+ー～~\u00C0-\u00FF"];
const HANGUL = ["\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uFFA0-\uFFDC\uFFA0-\uFFDC"];
const CYRILLIC_ALPHABET = ["\u0400-\u04FF"];

const LYRICS_FORMAT_REGEX = REGEX_LIST.concat(HANGUL).concat(CYRILLIC_ALPHABET); // TODO: .concat(this.customRegex);

const FILTER_SYMBOLS = "×";
export const useFormatWord = () => {
  const readImeTypeOptions = useReadImeTypeOptions();

  return (text: string) => {
    let formattedText = text;
    formattedText = formattedText.replace(/<[^>]*?style>[\s\S]*?<[^>]*?\/style[^>]*?>/g, ""); //styleタグ全体削除
    formattedText = formattedText.replace(/[（(].*?[)）]/g, ""); //()（）の歌詞を削除
    formattedText = formattedText.replace(/<[^>]*>(.*?)<[^>]*?\/[^>]*>/g, "$1"); //HTMLタグの中の文字を取り出す

    formattedText = formattedText.replace(/<[^>]*>/, "");

    formattedText = normalizeSymbols(formattedText);

    const { enableEngUpperCase, addSymbolList, enableAddSymbol } = readImeTypeOptions();
    if (enableEngUpperCase) {
      formattedText = formattedText.normalize("NFKC");
    } else {
      formattedText = formattedText.normalize("NFKC").toLowerCase();
    }

    // アルファベットと全角文字の間にスペースを追加
    formattedText = formattedText.replace(/([a-zA-Z])([ぁ-んゔァ-ンヴ一-龥])/g, "$1 $2"); // アルファベットの後に日本語文字がある場合
    formattedText = formattedText.replace(/([ぁ-んゔァ-ンヴ一-龥])([a-zA-Z])/g, "$1 $2"); // 日本語文字の後にアルファベットがある場合

    formattedText = formattedText.replace(new RegExp(FILTER_SYMBOLS, "g"), ""); //記号削除 TODO: ホワイトリストに含まれる機能はFILTERしない
    if (enableAddSymbol) {
      formattedText = formattedText.replace(
        new RegExp(`[${LYRICS_FORMAT_REGEX.concat([addSymbolList.replace(/./g, "\\$&")]).join("")}]`, "g"),
        "",
      ); //regexListに含まれていない文字を削除
    } else {
      formattedText = formattedText.replace(new RegExp(`[${LYRICS_FORMAT_REGEX.join("")}]`, "g"), ""); //regexListに含まれていない文字を削除
    }

    return formattedText;
  };
};
