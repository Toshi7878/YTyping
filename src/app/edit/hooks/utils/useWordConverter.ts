import { useSetIsWordConvertingState } from "@/app/edit/atoms/stateAtoms";
import {
  ALPHABET_LIST,
  KANA_LIST,
  LOOSE_SYMBOL_LIST,
  MANDATORY_SYMBOL_LIST,
  NUM_LIST,
  STRICT_SYMBOL_LIST,
} from "@/config/consts/charList";
import { clientApi } from "@/trpc/client-api";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useSession } from "next-auth/react";
import { useWordConvertOptionStateRef } from "../../atoms/storageAtoms";
import { ConvertOptionsType } from "../../ts/type";

const allowedChars = new Set([
  ...KANA_LIST,
  ...ALPHABET_LIST,
  ...MANDATORY_SYMBOL_LIST,
  ...LOOSE_SYMBOL_LIST,
  ...STRICT_SYMBOL_LIST,
  ...NUM_LIST,
]);

export const useWordConverter = () => {
  const fetchMorph = useFetchMorph();
  const filterWordSymbol = useFilterWordSymbol();
  const lyricsFormat = useLyricsFormat();
  const readWordCOnvertOption = useWordConvertOptionStateRef();

  return async (lyrics: string) => {
    const formatLyrics = lyricsFormat(lyrics);
    const convertOption = readWordCOnvertOption();
    const isNeedsConversion = /[\u4E00-\u9FFF]/.test(formatLyrics);

    const filterAllowedCharacters = (text: string): string => {
      return Array.from(text)
        .filter((char) => allowedChars.has(char))
        .join("");
    };

    if (isNeedsConversion) {
      const convertedWord = await fetchMorph(formatLyrics);
      return filterAllowedCharacters(filterWordSymbol({ kanaWord: convertedWord, convertOption }));
    } else {
      return filterAllowedCharacters(filterWordSymbol({ kanaWord: formatLyrics, convertOption }));
    }
  };
};

const useFetchMorph = () => {
  const utils = clientApi.useUtils();
  const kanaToHira = useKanaToHira();
  const setIsLoadWordConvert = useSetIsWordConvertingState();
  const toast = useCustomToast();
  const { data: session } = useSession();

  return async (sentence: string) => {
    setIsLoadWordConvert(true);
    try {
      const convertedWord = await utils.morphConvert.getKanaWordAws.ensureData(
        { sentence },
        {
          staleTime: Infinity,
        }
      );
      return kanaToHira(convertedWord);
    } catch {
      const message = !session ? "読み変換機能はログイン後に使用できます" : undefined;
      toast({ type: "error", title: "読み変換に失敗しました", message });
      return "";
    } finally {
      setIsLoadWordConvert(false);
    }
  };
};

const useKanaToHira = () => {
  return (str: string) => {
    return str
      .replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
      })
      .replace(/ヴ/g, "ゔ");
  };
};

const useLyricsFormat = () => {
  const kanaToHira = useKanaToHira();

  return (lyrics: string) => {
    const rubyConvert = lyrics.match(/<*ruby(?: .+?)?>.*?<*\/ruby*>/g);

    if (rubyConvert) {
      for (let v = 0; v < rubyConvert.length; v++) {
        const start = rubyConvert[v].indexOf("<rt>") + 4;
        const end = rubyConvert[v].indexOf("</rt>");
        const ruby = rubyConvert[v].slice(start, end);
        lyrics = lyrics.replace(rubyConvert[v], ruby);
      }
    }

    const sentence = kanaToHira(lyrics);

    return sentence
      .replace(/\r$/, "")
      .replace(/…/g, "...")
      .replace(/‥/g, "..")
      .replace(/･/g, "・")
      .replace(/“/g, '"')
      .replace(/”/g, '"')
      .replace(/〜/g, "～")
      .replace(/｢/g, "「")
      .replace(/｣/g, "」")
      .replace(/､/g, "、")
      .replace(/｡/g, "。")
      .replace(/　/g, " ")
      .replace(/ {2,}/g, " ")
      .replace(/－/g, "ー")
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .trim();
  };
};

const useFilterWordSymbol = () => {
  const generateFilterRegExp = (convertOption: ConvertOptionsType) => {
    if (convertOption === "non_symbol") {
      const filterChars = LOOSE_SYMBOL_LIST.concat(STRICT_SYMBOL_LIST)
        .map((s) => s.replace(/./g, "\\$&"))
        .join("");

      return new RegExp(`[${filterChars}]`, "g");
    }

    if (convertOption === "add_symbol") {
      const filterChars = STRICT_SYMBOL_LIST.map((s) => s.replace(/./g, "\\$&")).join("");

      return new RegExp(`[${filterChars}]`, "g");
    }

    return new RegExp("");
  };

  return ({ kanaWord, convertOption }: { kanaWord: string; convertOption: ConvertOptionsType }) => {
    const filterSymbolRegExp = generateFilterRegExp(convertOption);

    if (convertOption === "add_symbol_all") {
      return kanaWord.replace(filterSymbolRegExp, "");
    } else {
      const zenkakuAfterSpaceReg = /([^\x01-\x7E]) /g;
      const zenkakuBeforeSpaceReg = / ([^\x01-\x7E])/g;

      return kanaWord
        .replace(filterSymbolRegExp, "")
        .replace(zenkakuAfterSpaceReg, "$1")
        .replace(zenkakuBeforeSpaceReg, "$1");
    }
  };
};
