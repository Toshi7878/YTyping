import { normalizeSimilarSymbol } from "@/utils/build-map/normalizeSimilarSymbol";
import { useReadImeTypeOptions } from "../atoms/stateAtoms";

const REGEX_LIST = ["^-ぁ-んゔ", "ァ-ンヴ", "一-龥", "\\w", "\\d", " ", "々%&@&=+ー～~\u00C0-\u00FF"];
const HANGUL = ["\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uFFA0-\uFFDC\uFFA0-\uFFDC"];
const CYRILLIC_ALPHABET = ["\u0400-\u04FF"];

const LYRICS_FORMAT_REGEX = REGEX_LIST.concat(HANGUL).concat(CYRILLIC_ALPHABET); // TODO: .concat(this.customRegex);

const FILTER_SYMBOLS = "×";
export const useFormatWord = () => {
  const readImeTypeOptions = useReadImeTypeOptions();

  return (text: string) => {
    text = text.replace(/<[^>]*?style>[\s\S]*?<[^>]*?\/style[^>]*?>/g, ""); //styleタグ全体削除
    text = text.replace(/[（\(].*?[\)）]/g, ""); //()（）の歌詞を削除
    text = text.replace(/<[^>]*>(.*?)<[^>]*?\/[^>]*>/g, "$1"); //HTMLタグの中の文字を取り出す

    text = text.replace(/<[^>]*>/, ""); //単体のHTMLタグを削除

    text = normalizeSimilarSymbol(text); //記号整形

    const { enable_eng_upper_case, add_symbol_list, enable_add_symbol } = readImeTypeOptions();
    if (enable_eng_upper_case) {
      text = text.normalize("NFKC"); //全角を半角に変換
    } else {
      text = text.normalize("NFKC").toLowerCase(); //全角を半角に変換 & 小文字に変換;
    }

    // アルファベットと全角文字の間にスペースを追加
    text = text.replace(/([a-zA-Z])([ぁ-んゔァ-ンヴ一-龥])/g, "$1 $2"); // アルファベットの後に日本語文字がある場合
    text = text.replace(/([ぁ-んゔァ-ンヴ一-龥])([a-zA-Z])/g, "$1 $2"); // 日本語文字の後にアルファベットがある場合

    text = text.replace(new RegExp(FILTER_SYMBOLS, "g"), ""); //記号削除　TODO: ホワイトリストに含まれる機能はFILTERしない
    if (enable_add_symbol) {
      text = text.replace(
        new RegExp(`[${LYRICS_FORMAT_REGEX.concat([add_symbol_list.replace(/./g, "\\$&")]).join("")}]`, "g"),
        "",
      ); //regexListに含まれていない文字を削除
    } else {
      text = text.replace(new RegExp(`[${LYRICS_FORMAT_REGEX.join("")}]`, "g"), ""); //regexListに含まれていない文字を削除
    }

    return text;
  };
};
