import { editWordConvertOptionAtom } from "@/app/edit/edit-atom/editAtom";
import {
  ALPHABET_LIST,
  KANA_LIST,
  LOOSE_SYMBOL_LIST,
  MANDATORY_SYMBOL_LIST,
  NUM_LIST,
  STRICT_SYMBOL_LIST,
} from "@/config/consts/charList";
import { useStore as useJotaiStore } from "jotai";
import { ConvertOptionsType } from "../ts/type";

const allowedChars = new Set([
  ...KANA_LIST,
  ...ALPHABET_LIST,
  ...MANDATORY_SYMBOL_LIST,
  ...LOOSE_SYMBOL_LIST,
  ...STRICT_SYMBOL_LIST,
  ...NUM_LIST,
]);

export const useWordConvert = () => {
  const editAtomStore = useJotaiStore();

  return async (lyrics: string) => {
    const convertOption = editAtomStore.get(editWordConvertOptionAtom);
    const wordConvert = new WordConvert(convertOption);
    const word = lyrics ? await wordConvert.convert(lyrics) : "";
    return word ?? "";
  };
};

const filterAllowedCharacters = (text: string): string => {
  return Array.from(text)
    .filter((char) => allowedChars.has(char))
    .join("");
};

class WordConvert {
  filterSymbolChars: string;
  convertMode: ConvertOptionsType;

  constructor(convertOption: ConvertOptionsType) {
    this.filterSymbolChars = "";
    this.convertMode = convertOption;
  }

  async convert(lyrics: string) {
    lyrics = this.wordFormat(lyrics);
    this.filterSymbolChars = this.createFilterSymbolList();
    const WORD = await this.postMorphAPI(lyrics);

    return WORD;
  }

  wordFormat(lyrics: string) {
    const ruby_convert = lyrics.match(/<*ruby(?: .+?)?>.*?<*\/ruby*>/g);

    if (ruby_convert) {
      for (let v = 0; v < ruby_convert.length; v++) {
        const start = ruby_convert[v].indexOf("<rt>") + 4;
        const end = ruby_convert[v].indexOf("</rt>");
        const ruby = ruby_convert[v].slice(start, end);
        lyrics = lyrics.replace(ruby_convert[v], ruby);
      }
    }

    return lyrics
      .replace(/[ 　]+$/, "")
      .replace(/^[ 　]+/, "")
      .replace(/…/g, "...")
      .replace(/‥/g, "..")
      .replace(/･/g, "・")
      .replace(/〜/g, "～")
      .replace(/｢/g, "「")
      .replace(/｣/g, "」")
      .replace(/､/g, "、")
      .replace(/｡/g, "。")
      .replace(/　/g, " ")
      .replace(/ {2,}/g, " ")
      .replace(/ヴ/g, "ゔ")
      .replace(/－/g, "ー")
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  }

  createFilterSymbolList() {
    if (this.convertMode === "non_symbol") {
      return LOOSE_SYMBOL_LIST.concat(STRICT_SYMBOL_LIST)
        .map((s) => s.replace(/./g, "\\$&"))
        .join("");
    }

    if (this.convertMode === "add_symbol") {
      return STRICT_SYMBOL_LIST.map((s) => s.replace(/./g, "\\$&")).join("");
    }

    return "";
  }

  async postMorphAPI(SENTENCE: string) {
    const kanaSentence = this.kanaToHira(SENTENCE.replace(/\r$/, ""));
    const isNotConvertSentence = Array.from(kanaSentence).every((char) => allowedChars.has(char));
    if (isNotConvertSentence) {
      return this.createWord(kanaSentence);
    }

    const response = await fetch("/api/morph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sentence: JSON.stringify(kanaSentence),
      }),
    });

    if (!response.ok) {
      throw new Error(`API エラー: ${response.status}`);
    }

    const responseData = await response.json();
    const readingKana = responseData.tokens
      .slice(1, -1)
      .map((char: string) => char[1])
      .join("");

    const filterReadingKana = this.kanaToHira(filterAllowedCharacters(readingKana));

    return this.createWord(filterReadingKana);
  }

  createWord(kanaWord: string) {
    const filterSymbolReg = new RegExp(`[${this.filterSymbolChars}]`, "g");

    if (this.convertMode === "add_symbol_all") {
      return kanaWord.replace(filterSymbolReg, "");
    } else {
      const zenkakuAfterSpaceReg = /([^\x01-\x7E]) /g;
      const zenkakuBeforeSpaceReg = / ([^\x01-\x7E])/g;

      return kanaWord
        .replace(filterSymbolReg, "")
        .replace(zenkakuAfterSpaceReg, "$1")
        .replace(zenkakuBeforeSpaceReg, "$1");
    }
  }

  kanaToHira(str: string) {
    return str
      .replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
      })
      .replace(/ヴ/g, "ゔ");
  }
}
