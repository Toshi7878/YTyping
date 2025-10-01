import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSetIsWordConverting } from "@/app/edit/_lib/atoms/state-atoms";
import { LOOSE_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/utils/build-map/const";
import { useMorphQueries } from "@/utils/queries/morph.queries";
import {
  kanaToHira,
  normalizeExclamationQuestionMarks,
  normalizeFullWidthAlnum,
  normalizeSymbols,
} from "@/utils/string-transform";
import { useReplaceReadingWithCustomDict } from "@/utils/use-replace-reading-with-custom-dict";
import type { ConvertOption } from "../atoms/storage-atoms";
import { useReadWordConvertOption } from "../atoms/storage-atoms";
import { filterToTypableWordChars } from "../utils/filter-word";

export const useWordConverter = () => {
  const fetchMorph = useFetchMorph();
  const filterWordSymbol = filterWordSymbolsByOption();

  return async (lyrics: string) => {
    const formatedLyrics = normalizeSymbols(normalizeFullWidthAlnum(kanaToHira(rubyToKana(lyrics))));
    const isNeedsConversion = /[\u4E00-\u9FFF]/.test(formatedLyrics);

    if (isNeedsConversion) {
      const convertedWord = await fetchMorph(formatedLyrics);
      return normalizeExclamationQuestionMarks(filterToTypableWordChars(filterWordSymbol({ sentence: convertedWord })));
    }

    return normalizeExclamationQuestionMarks(filterToTypableWordChars(filterWordSymbol({ sentence: formatedLyrics })));
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

      let processedSentence = sentence;
      for (const { surface, reading } of regexDict) {
        const regex = new RegExp(surface, "g");
        processedSentence = processedSentence.replace(regex, reading);
      }

      const tokenizedWord = await queryClient.ensureQueryData(
        morphQueries.tokenizeSentence({ sentence: processedSentence }),
      );

      const result = await replaceReadingWithCustomDic(tokenizedWord);
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

const rubyToKana = (text: string): string => {
  const rubyMatches = text.match(/<*ruby(?: .+?)?>.*?<*\/ruby*>/g);

  let convertedText = text;
  if (rubyMatches) {
    for (const element of rubyMatches) {
      const start = element.indexOf("<rt>") + 4;
      const end = element.indexOf("</rt>");
      const ruby = element.slice(start, end);
      convertedText = convertedText.replace(element, ruby);
    }
  }

  return convertedText;
};

export const filterWordSymbolsByOption = () => {
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

    return /(?:)/;
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
};
