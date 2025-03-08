import { editWordConvertOptionAtom } from "@/app/edit/edit-atom/editAtom";
import { useStore as useJotaiStore } from "jotai";

const convertChar = ["ゔ"];

export const nonSymbol: string[] = [" ", "ー", "'", "＇", "%", "％", "&", "＆", "@", "＠"];
export const addSymbol: string[] = [
  ",",
  ".",
  "、",
  "。",
  "，",
  "．",
  "-",
  "!",
  "?",
  "！",
  "？",
  "~",
  "～",
  "#",
  "＃",
  "$",
  "＄",
  "=",
  "＝",
  "*",
  "＊",
  "+",
  "＋",
  "/",
  "・",
];
export const addSymbolAll: string[] = [
  "\\",
  "￥",
  '"',
  "＂",
  "[",
  "]",
  "『",
  "』",
  "「",
  "」",
  "［",
  "］",
  "^",
  "＾",
  "|",
  "｜",
  "（",
  "）",
  "(",
  ")",
  "`",
  "｀",
  ":",
  "：",
  ";",
  "；",
  "<",
  "＜",
  ">",
  "＞",
  "_",
  "＿",
  "{",
  "｛",
  "}",
  "｝",
];

export const useWordConvert = () => {
  const editAtomStore = useJotaiStore();

  return async (lyrics: string) => {
    const convertOption = editAtomStore.get(editWordConvertOptionAtom);
    const wordConvert = new WordConvert(convertOption);
    const word = lyrics ? await wordConvert.convert(lyrics) : "";
    return word ?? "";
  };
};

class WordConvert {
  symbolList: string[];
  convertMode: string;
  constructor(convertOption: string) {
    this.symbolList = [];
    this.convertMode = convertOption;
  }

  async convert(lyrics: string) {
    lyrics = this.wordFormat(lyrics);
    this.symbolList = this.createSymbolList();
    const WORD = await this.postMorphAPI(lyrics);

    return WORD;
  }

  wordFormat(Lyric: string) {
    const ruby_convert = Lyric.match(/<*ruby(?: .+?)?>.*?<*\/ruby*>/g);

    if (ruby_convert) {
      for (let v = 0; v < ruby_convert.length; v++) {
        const start = ruby_convert[v].indexOf("<rt>") + 4;
        const end = ruby_convert[v].indexOf("</rt>");
        const ruby = ruby_convert[v].slice(start, end);
        Lyric = Lyric.replace(ruby_convert[v], ruby);
      }
    }

    return Lyric.replace(/[ 　]+$/, "")
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
      .replace(/－/g, "ー");
  }

  createSymbolList() {
    let result: string[] = [...nonSymbol, ...convertChar];
    if (this.convertMode.match("add_symbol")) {
      result = result.concat(addSymbol as string[]);
    }
    if (this.convertMode == "add_symbol_all") {
      result = result.concat(addSymbolAll as string[]);
    }
    return result;
  }

  async postMorphAPI(SENTENCE: string) {
    try {
      const response = await fetch("/api/morph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sentence: JSON.stringify(SENTENCE.replace(/\r$/, "")),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      const list = responseData.tokens.slice(1, -1).map((char) => [char[0], char[1]]);

      return this.createWord(list).join("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  }

  createWord(LIST: [string, string][]) {
    let result: string[] = [];

    for (let i = 0; i < LIST.length; i++) {
      const char = { kanji: LIST[i][0].replace("\\\\", "\\"), kana: LIST[i][1] };
      const IS_ZENKAKU = /^[^\x01-\x7E\xA1-\xDF]+$/.test(char.kanji);
      const IS_ADD_SYMBOL = this.symbolList.includes(char.kanji.slice(0, 1));
      const IS_SYMBOL = nonSymbol.concat(addSymbol).concat(addSymbolAll).includes(char.kanji);
      if (IS_ADD_SYMBOL) {
        //記号
        //半角の後にスペースがある場合はスペース挿入
        if (this.convertMode != "add_symbol_all" && char.kanji == " ") {
          const IS_HANKAKU = !/^[^\x01-\x7E\xA1-\xDF]+$/.test(LIST[i - 1][0]);
          const IS_NEXT_ZENKAKU = /^[^\x01-\x7E\xA1-\xDF]+$/.test(LIST[i + 1]?.[0][0] ?? "");
          if (IS_HANKAKU && !IS_NEXT_ZENKAKU) {
            result.push(char.kanji);
          }
        } else {
          result.push(char.kanji);
        }
      } else if (IS_ZENKAKU) {
        // 全角文字の時の処理を記述
        result.push(this.kanaToHira(char.kana));
      } else {
        // 半角文字の時の処理を記述
        const NON_ADD_SYMBOL = !IS_ADD_SYMBOL && IS_SYMBOL;
        if (NON_ADD_SYMBOL) {
          continue;
        }
        result.push(char.kanji);
      }
    }

    return result;
  }

  kanaToHira(str: string) {
    return str.replace(/[\u30a1-\u30f6]/g, function (match) {
      var chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }
}
