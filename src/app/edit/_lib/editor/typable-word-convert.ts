import { toast } from "sonner";
import { setIsWordConverting } from "@/app/edit/_lib/atoms/state";
import { LOOSE_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/app/edit/_lib/const";
import { replaceReadingWithCustomDict } from "@/lib/build-map/replace-reading-with-custom-dict";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";
import {
	kanaToHira,
	normalizeExclamationQuestionMarks,
	normalizeFullWidthAlnum,
	normalizeSymbols,
} from "@/utils/string-transform";
import { type ConvertOption, readWordConvertOption } from "../atoms/storage";
import { filterToTypableWordChars } from "../utils/filter-word";

export const wordConvert = async (lyrics: string) => {
  const formatedLyrics = normalizeSymbols(normalizeFullWidthAlnum(kanaToHira(rubyToKana(lyrics))));
  const isNeedsConversion = /[\u4E00-\u9FFF]/.test(formatedLyrics);

  if (isNeedsConversion) {
    const convertedWord = await fetchReading(formatedLyrics);
    return normalizeExclamationQuestionMarks(filterToTypableWordChars(filterWordSymbol({ sentence: convertedWord })));
  }

  return normalizeExclamationQuestionMarks(filterToTypableWordChars(filterWordSymbol({ sentence: formatedLyrics })));
};

const fetchReading = async (sentence: string) => {
  setIsWordConverting(true);
  const queryClient = getQueryClient();
  const trpcOptions = getTRPCOptionsProxy();
  try {
    const { regexDict } = await queryClient.ensureQueryData(
      trpcOptions.morphConvert.getCustomDict.queryOptions(undefined, {
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    );

    let processedSentence = sentence;
    for (const { surface, reading } of regexDict) {
      const regex = new RegExp(surface, "g");
      processedSentence = processedSentence.replace(regex, reading);
    }

    const tokenizedWord = await queryClient.ensureQueryData(
      trpcOptions.morphConvert.tokenizeSentence.queryOptions(
        { sentence: processedSentence },
        { staleTime: Infinity, gcTime: Infinity },
      ),
    );

    const result = await replaceReadingWithCustomDict(tokenizedWord);
    return result.readings.join("");
  } catch {
    // const message = session ? undefined : "読み変換機能はログイン後に使用できます";
    const message = undefined;
    toast.error("読み変換に失敗しました", { description: message });
    return "";
  } finally {
    setIsWordConverting(false);
  }
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

export const filterWordSymbol = ({
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
