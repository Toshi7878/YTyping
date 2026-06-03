import { atom, useAtomValue } from "jotai";
import { toast } from "sonner";
import { hasMapUploadPermission } from "@/app/edit/_feature/permission/has-permission";
import { store, useCreatorId } from "@/app/edit/_feature/provider";
import { useSession } from "@/auth/client";
import { replaceReadingWithCustomDict } from "@/shared/morph/replace-reading-with-custom-dict";
import { getQueryClient, getTRPCOptions } from "@/trpc/provider";
import { Button } from "@/ui/button";
import {
  katakanaToHiragana,
  normalizeExclamationQuestionMarks,
  normalizeFullWidthAlnum,
  normalizeSymbols,
} from "@/utils/string";
import { filterToTypableWordChars } from "../../../utils/filter-word";
import { filterWordSymbol } from "../filter-word-symbol";
import { getSelectLine, setWord } from "../line-input";

const isWordConvertingAtom = atom(false);
export const setIsWordConverting = (value: boolean) => store.set(isWordConvertingAtom, value);

export const WordConvertButton = ({
  className,
  label,
  variant,
}: {
  className: string;
  label: string;
  variant: React.ComponentProps<typeof Button>["variant"];
}) => {
  const { data: session } = useSession();
  const creatorId = useCreatorId();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);
  const isWordConverting = useAtomValue(isWordConvertingAtom);

  const handleClick = async () => {
    if (!hasUploadPermission) {
      toast.warning("読み変換機能は編集保存権限が有効な場合に使用できます");
      return;
    }

    const { lyrics } = getSelectLine();
    const word = await wordConvertAction(lyrics);
    setWord(word);
  };

  return (
    <Button loading={isWordConverting} variant={variant} size="sm" className={className} onClick={handleClick}>
      {label}
    </Button>
  );
};

export const wordConvertAction = async (lyrics: string) => {
  const formatedLyrics = normalizeSymbols(normalizeFullWidthAlnum(katakanaToHiragana(rubyToKana(lyrics))));
  const isNeedsConversion = /[\u4E00-\u9FFF]/.test(formatedLyrics);

  if (isNeedsConversion) {
    const convertedWord = await fetchReading(formatedLyrics);
    return normalizeExclamationQuestionMarks(filterToTypableWordChars(filterWordSymbol({ sentence: convertedWord })));
  }

  return normalizeExclamationQuestionMarks(filterToTypableWordChars(filterWordSymbol({ sentence: formatedLyrics })));
};

const fetchReading = async (sentence: string) => {
  setIsWordConverting(true);
  const trpc = getTRPCOptions();
  const queryClient = getQueryClient();
  try {
    const { regexDict } = await queryClient.ensureQueryData(
      trpc.morph.getCustomDict.queryOptions(undefined, {
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
      trpc.morph.tokenizeSentence.queryOptions(
        { sentence: processedSentence },
        { staleTime: Infinity, gcTime: Infinity },
      ),
    );

    const result = await replaceReadingWithCustomDict(tokenizedWord);
    return result.readings.join("");
  } catch {
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
