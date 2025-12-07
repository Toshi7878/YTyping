import type { InputMode } from "lyrics-typing-engine";
import { useEffect, useRef } from "react";
import { useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import {
  useBuiltMapState,
  usePlayingInputModeState,
  useReplayRankingResultState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { cn } from "@/lib/utils";
import { setMainWordElements, setSubWordElements, useIsLineCompletedState } from "../../../_lib/atoms/typing-word";

export const TypingWords = () => {
  const inputMode = usePlayingInputModeState();
  const builtMap = useBuiltMapState();
  const {
    wordDisplay,
    subWordFontSize,
    subWordTopPosition,
    romaWordSpacing,
    mainWordFontSize,
    mainWordTopPosition,
    kanaWordSpacing,
    lineCompletedDisplay,
    isCaseSensitive: isCaseSensitiveTypingOptions,
  } = useTypingOptionsState();
  const replayRankingResult = useReplayRankingResultState();
  const { otherStatus } = replayRankingResult ?? {};
  const isCaseSensitive = otherStatus?.isCaseSensitive ?? (builtMap?.isCaseSensitive || isCaseSensitiveTypingOptions);

  const isLineCompleted = useIsLineCompletedState();

  const mainWord = wordDisplay.startsWith("KANA_") || inputMode === "kana" ? "kana" : "roma";
  const mainRefs = useRef({
    viewportRef: { current: null as HTMLDivElement | null },
    trackRef: { current: null as HTMLDivElement | null },
    caretRef: { current: null as HTMLSpanElement | null },
    nextWordRef: { current: null as HTMLSpanElement | null },
  }).current;

  const subRefs = useRef({
    viewportRef: { current: null as HTMLDivElement | null },
    trackRef: { current: null as HTMLDivElement | null },
    caretRef: { current: null as HTMLSpanElement | null },
    nextWordRef: { current: null as HTMLSpanElement | null },
  }).current;

  const style = {
    kanaLetterSpacing: `${kanaWordSpacing.toFixed(2)}em`,
    romaLetterSpacing: `${romaWordSpacing.toFixed(2)}em`,
  };

  useEffect(() => {
    if (
      mainRefs.viewportRef.current &&
      mainRefs.trackRef.current &&
      mainRefs.caretRef.current &&
      mainRefs.nextWordRef.current
    ) {
      setMainWordElements({
        viewportRef: mainRefs.viewportRef.current,
        trackRef: mainRefs.trackRef.current,
        caretRef: mainRefs.caretRef.current,
        nextWordRef: mainRefs.nextWordRef.current,
      });
    }
    if (
      subRefs.viewportRef.current &&
      subRefs.trackRef.current &&
      subRefs.caretRef.current &&
      subRefs.nextWordRef.current
    ) {
      setSubWordElements({
        viewportRef: subRefs.viewportRef.current,
        trackRef: subRefs.trackRef.current,
        caretRef: subRefs.caretRef.current,
        nextWordRef: subRefs.nextWordRef.current,
      });
    }
  }, []);

  return (
    <div
      className={cn(
        "w-full word-font word-outline-text text-7xl leading-24 md:text-[2.8rem] md:leading-15",
        isLineCompleted && "word-area-completed",
      )}
    >
      <Word
        id="main_word"
        isLineCompleted={isLineCompleted}
        className={cn(
          mainWord === "kana" ? "word-kana" : "word-roma",
          getWordCaseClass(mainWord === "kana" ? "kana" : "roma", isCaseSensitive, wordDisplay),
          getWordVisibilityClass(mainWord === "kana" ? "kana" : "roma", wordDisplay, inputMode),
        )}
        style={{
          fontSize: `${mainWordFontSize}%`,
          bottom: mainWordTopPosition,
          letterSpacing: mainWord === "kana" ? style.kanaLetterSpacing : style.romaLetterSpacing,
        }}
        refs={mainRefs}
        isCompletedNextWord={lineCompletedDisplay === "NEXT_WORD"}
      />
      <Word
        id="sub_word"
        isLineCompleted={isLineCompleted}
        className={cn(
          mainWord === "kana" ? "word-roma" : "word-kana",
          getWordCaseClass(mainWord === "kana" ? "roma" : "kana", isCaseSensitive, wordDisplay),
          getWordVisibilityClass(mainWord === "kana" ? "roma" : "kana", wordDisplay, inputMode),
        )}
        style={{
          fontSize: `${subWordFontSize}%`,
          bottom: subWordTopPosition,
          letterSpacing: mainWord === "kana" ? style.romaLetterSpacing : style.kanaLetterSpacing,
        }}
        refs={subRefs}
        isCompletedNextWord={lineCompletedDisplay === "NEXT_WORD"}
      />
    </div>
  );
};

const getWordCaseClass = (targetType: "kana" | "roma", isCaseSensitive: boolean, wordDisplay: string) => {
  if (isCaseSensitive) return undefined;

  if (targetType === "kana") {
    return "lowercase";
  }

  return wordDisplay.includes("UPPERCASE") ? "uppercase" : "lowercase";
};

const getWordVisibilityClass = (targetType: "kana" | "roma", wordDisplay: string, inputMode: InputMode) => {
  if (targetType === "kana") {
    if (wordDisplay === "ROMA_LOWERCASE_ONLY" || wordDisplay === "ROMA_UPPERCASE_ONLY") {
      return "invisible";
    }
  } else if (wordDisplay === "KANA_ONLY" || inputMode !== "roma") {
    return "invisible";
  }

  if (inputMode === targetType) {
    return "visible";
  }

  return undefined;
};

interface WordProps {
  id: string;
  refs: {
    viewportRef: React.RefObject<HTMLDivElement | null>;
    trackRef: React.RefObject<HTMLDivElement | null>;
    caretRef: React.RefObject<HTMLSpanElement | null>;
    nextWordRef: React.RefObject<HTMLSpanElement | null>;
  };
  className: string;
  style: React.CSSProperties;
  isLineCompleted: boolean;
  isCompletedNextWord: boolean;
}

const Word = ({ refs, className, style, isLineCompleted, isCompletedNextWord }: WordProps) => {
  const isDisplayNextWord = isLineCompleted && isCompletedNextWord;
  return (
    <div className={cn("relative w-full", className)} style={style}>
      <span
        ref={refs.nextWordRef}
        className={cn("next-line-word text-word-nextWord hidden", isDisplayNextWord && "block")}
      >
        {"\u200B"}
      </span>
      <div ref={refs.viewportRef} className={cn("overflow-hidden contain-content", isDisplayNextWord && "hidden")}>
        {"\u200B"}
        <div ref={refs.trackRef} className="inline-block">
          <span
            className={cn("opacity-word-correct text-word-correct", isLineCompleted && "text-word-completed")}
          ></span>
          <span ref={refs.caretRef} className="text-word-nextChar"></span>
          <span className="text-word-word"></span>
        </div>
      </div>
    </div>
  );
};
