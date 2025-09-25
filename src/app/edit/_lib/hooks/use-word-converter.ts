import { useSetIsWordConverting } from "@/app/edit/_lib/atoms/state-atoms";

import {
  ALPHABET_LIST,
  KANA_LIST,
  LOOSE_SYMBOL_LIST,
  MANDATORY_SYMBOL_LIST,
  NUM_LIST,
  STRICT_SYMBOL_LIST,
} from "@/utils/build-map/const";
import { normalizeSimilarSymbol } from "@/utils/build-map/normalize-similar-symbol";
import { kanaToHira } from "@/utils/kana-to-hira";
import { useMorphQueries } from "@/utils/queries/morph.queries";
import { useReplaceReadingWithCustomDict } from "@/utils/use-replace-reading-with-custom-dict";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { ConvertOption } from "../atoms/storage-atoms";
import { useReadWordConvertOption } from "../atoms/storage-atoms";

const allowedChars = new Set([
  ...KANA_LIST,
  ...ALPHABET_LIST,
  ...MANDATORY_SYMBOL_LIST,
  ...LOOSE_SYMBOL_LIST,
  ...STRICT_SYMBOL_LIST,
  ...NUM_LIST,
]);

const filterAllowedCharacters = (text: string): string => {
  return [...text].filter((char) => allowedChars.has(char)).join("");
};

export const useWordConverter = () => {
  const fetchMorph = useFetchMorph();
  const filterWordSymbol = useFilterWordSymbol();
  const { rubyKanaConvert, formatSimilarChar, transformSymbolBasedOnPreviousChar } = useLyricsFormatUtilities();

  return async (lyrics: string) => {
    const formatedLyrics = formatSimilarChar(kanaToHira(rubyKanaConvert(lyrics)));
    const isNeedsConversion = /[\u4E00-\u9FFF]/.test(formatedLyrics);

    if (isNeedsConversion) {
      const convertedWord = await fetchMorph(formatedLyrics);
      return transformSymbolBasedOnPreviousChar(filterAllowedCharacters(filterWordSymbol({ sentence: convertedWord })));
    } else {
      return transformSymbolBasedOnPreviousChar(
        filterAllowedCharacters(filterWordSymbol({ sentence: formatedLyrics })),
      );
    }
  };
};

const useFetchMorph = () => {
  const setIsLoadWordConvert = useSetIsWordConverting();
  const replaceReadingWithCustomDic = useReplaceReadingWithCustomDict();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const morphQueries = useMorphQueries();

  return async (sentence: string) => {
    setIsLoadWordConvert(true);
    try {
      const { regexDict } = await queryClient.ensureQueryData(morphQueries.customDic());

      for (const { surface, reading } of regexDict) {
        const regex = new RegExp(surface, "g");
        sentence = sentence.replace(regex, reading);
      }

      const convertedWord = await queryClient.ensureQueryData(morphQueries.tokenizeSentence({ sentence }));

      const result = await replaceReadingWithCustomDic(convertedWord);
      return result.readings.join("");
    } catch {
      const message = session ? undefined : "読み変換機能はログイン後に使用できます";
      toast.error("読み変換に失敗しました", { description: message });
      return "";
    } finally {
      setIsLoadWordConvert(false);
    }
  };
};

export const filterUnicodeSymbol = (text: string): string => {
  const allowedSymbols = new Set([...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST, ...STRICT_SYMBOL_LIST]);

  return text.replaceAll(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{ASCII}\d\s]/gu, (char) =>
    allowedSymbols.has(char) ? char : "",
  );
};

export const formatSimilarChar = (lyrics: string) => {
  return normalizeSimilarSymbol(lyrics)
    .replaceAll(/[０-９]/g, (s) => String.fromCodePoint(s.codePointAt(0) - 0xfe_e0))
    .replaceAll(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCodePoint(s.codePointAt(0) - 0xfe_e0));
};

export const useLyricsFormatUtilities = () => {
  const rubyKanaConvert = (lyrics: string) => {
    const rubyConvert = lyrics.match(/<*ruby(?: .+?)?>.*?<*\/ruby*>/g);

    if (rubyConvert) {
      for (const element of rubyConvert) {
        const start = element.indexOf("<rt>") + 4;
        const end = element.indexOf("</rt>");
        const ruby = element.slice(start, end);
        lyrics = lyrics.replace(element, ruby);
      }
    }

    return lyrics;
  };

  const transformSymbolBasedOnPreviousChar = (reading: string) => {
    const convertedText = reading
      .replaceAll(/([^\u0020-\u007E])(!+)/g, (_, p1, p2) => p1 + "！".repeat(p2.length))
      .replaceAll(/([^\u0020-\u007E])(\?+)/g, (_, p1, p2) => p1 + "？".repeat(p2.length))
      .replaceAll(/([\u0020-\u007E])(！+)/g, (_, p1, p2) => p1 + "!".repeat(p2.length))
      .replaceAll(/([\u0020-\u007E])(？+)/g, (_, p1, p2) => p1 + "?".repeat(p2.length));

    return convertedText;
  };

  return { formatSimilarChar, rubyKanaConvert, filterUnicodeSymbol, transformSymbolBasedOnPreviousChar };
};

export const useFilterWordSymbol = () => {
  const readWordConvertOption = useReadWordConvertOption();

  const generateFilterRegExp = (convertOption: ConvertOption) => {
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
      const zenkakuAfterSpaceReg = /([^\u0020-\u007E]) /g;
      const zenkakuBeforeSpaceReg = / ([^\u0020-\u007E])/g;

      let result = sentence.replace(filterSymbolRegExp, replaceChar);

      if (filterType === "wordConvert") {
        result = result.replaceAll(zenkakuAfterSpaceReg, "$1").replaceAll(zenkakuBeforeSpaceReg, "$1");
      }

      return result;
    }
  };
};
