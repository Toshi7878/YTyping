import { useSetIsWordConverting } from "@/app/edit/atoms/stateAtoms";
import {
  ALPHABET_LIST,
  KANA_LIST,
  LOOSE_SYMBOL_LIST,
  MANDATORY_SYMBOL_LIST,
  NUM_LIST,
  STRICT_SYMBOL_LIST,
} from "@/config/consts/charList";
import { clientApi } from "@/trpc/client-api";
import { useFetchCustomDic } from "@/util/global-hooks/fetch/fetchCustomDic";
import { kanaToHira } from "@/util/global-hooks/kanaToHira";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useReplaceReadingWithCustomDic } from "@/util/global-hooks/useMorphReplaceCustomDic";
import { normalizeSimilarSymbol } from "@/util/parse-map/normalizeSimilarSymbol";
import { useSession } from "next-auth/react";
import { useReadWordConvertOption } from "../../atoms/storageAtoms";
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
  const { rubyKanaConvert, formatSimilarChar, transformSymbolBasedOnPreviousChar } = useLyricsFormatUtils();

  return async (lyrics: string) => {
    const formatedLyrics = formatSimilarChar(kanaToHira(rubyKanaConvert(lyrics)));
    const isNeedsConversion = /[\u4E00-\u9FFF]/.test(formatedLyrics);

    const filterAllowedCharacters = (text: string): string => {
      return Array.from(text)
        .filter((char) => allowedChars.has(char))
        .join("");
    };

    if (isNeedsConversion) {
      const convertedWord = await fetchMorph(filterWordSymbol({ sentence: formatedLyrics }));
      return transformSymbolBasedOnPreviousChar(filterAllowedCharacters(convertedWord));
    } else {
      return transformSymbolBasedOnPreviousChar(filterAllowedCharacters(formatedLyrics));
    }
  };
};

const useFetchMorph = () => {
  const utils = clientApi.useUtils();
  const setIsLoadWordConvert = useSetIsWordConverting();
  const toast = useCustomToast();
  const replaceReadingWithCustomDic = useReplaceReadingWithCustomDic();
  const { data: session } = useSession();
  const fetchCustomDic = useFetchCustomDic();

  return async (sentence: string) => {
    setIsLoadWordConvert(true);
    try {
      const { customRegexDic } = await fetchCustomDic();

      sentence = customRegexDic.reduce((acc, { surface, reading }) => {
        const regex = new RegExp(surface, "g");
        return acc.replace(regex, reading);
      }, sentence);

      const convertedWord = await utils.morphConvert.tokenizeWordAws.ensureData(
        { sentence },
        {
          staleTime: Infinity,
        }
      );

      return (await replaceReadingWithCustomDic(convertedWord)).readings.join("");
    } catch {
      const message = !session ? "読み変換機能はログイン後に使用できます" : undefined;
      toast({ type: "error", title: "読み変換に失敗しました", message });
      return "";
    } finally {
      setIsLoadWordConvert(false);
    }
  };
};

export const useLyricsFormatUtils = () => {
  const rubyKanaConvert = (lyrics: string) => {
    const rubyConvert = lyrics.match(/<*ruby(?: .+?)?>.*?<*\/ruby*>/g);

    if (rubyConvert) {
      for (let v = 0; v < rubyConvert.length; v++) {
        const start = rubyConvert[v].indexOf("<rt>") + 4;
        const end = rubyConvert[v].indexOf("</rt>");
        const ruby = rubyConvert[v].slice(start, end);
        lyrics = lyrics.replace(rubyConvert[v], ruby);
      }
    }

    return lyrics;
  };

  const formatSimilarChar = (lyrics: string) => {
    return normalizeSimilarSymbol(lyrics)
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  };

  const filterUnicodeSymbol = (text: string): string => {
    const allowedSymbols = [...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST, ...STRICT_SYMBOL_LIST];

    return text.replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{ASCII}\d\s]/gu, (char) =>
      allowedSymbols.includes(char) ? char : ""
    );
  };

  const transformSymbolBasedOnPreviousChar = (reading: string) => {
    const convertedText = reading
      .replace(/([^\x01-\x7E])(!+)/g, (_, p1, p2) => p1 + "！".repeat(p2.length))
      .replace(/([^\x01-\x7E])(\?+)/g, (_, p1, p2) => p1 + "？".repeat(p2.length))
      .replace(/([\x01-\x7E])(！+)/g, (_, p1, p2) => p1 + "!".repeat(p2.length))
      .replace(/([\x01-\x7E])(？+)/g, (_, p1, p2) => p1 + "?".repeat(p2.length));

    return convertedText;
  };

  return { formatSimilarChar, rubyKanaConvert, filterUnicodeSymbol, transformSymbolBasedOnPreviousChar };
};

export const useFilterWordSymbol = () => {
  const readWordConvertOption = useReadWordConvertOption();

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

  return ({
    sentence,
    filterType = "wordConvert",
    replaceChar = "",
  }: {
    sentence: string;
    filterType?: "wordConvert" | "lyricsWithFilterSymbol";
    replaceChar?: string;
  }) => {
    const convertOption = readWordConvertOption();
    const filterSymbolRegExp = generateFilterRegExp(convertOption);
    if (convertOption === "add_symbol_all") {
      return sentence;
    } else {
      //全角文字の前後のスペースをフィルター
      const zenkakuAfterSpaceReg = /([^\x01-\x7E]) /g;
      const zenkakuBeforeSpaceReg = / ([^\x01-\x7E])/g;

      let result = sentence.replace(filterSymbolRegExp, replaceChar);

      if (filterType === "wordConvert") {
        result = result.replace(zenkakuAfterSpaceReg, "$1").replace(zenkakuBeforeSpaceReg, "$1");
      }

      return result;
    }
  };
};
