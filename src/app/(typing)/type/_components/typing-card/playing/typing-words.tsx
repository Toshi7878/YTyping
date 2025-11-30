import type { HTMLAttributes } from "react";
import { useLayoutEffect, useRef } from "react";
import { useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import {
  useBuiltMapState,
  useNextLyricsState,
  usePlayingInputModeState,
  useReplayRankingResultState,
  useTypingWordState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { cn } from "@/lib/utils";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";

export const TypingWords = () => {
  const typingWord = useTypingWordState();
  const inputMode = usePlayingInputModeState();
  const nextLyrics = useNextLyricsState();
  const builtMap = useBuiltMapState();
  const {
    wordDisplay,
    subWordFontSize,
    subWordTopPosition,
    romaWordSpacing,
    mainWordFontSize,
    mainWordTopPosition,
    kanaWordSpacing,
    mainWordScrollStart,
    subWordScrollStart,
    isSmoothScroll,
    isCaseSensitive: isCaseSensitiveTypingOptions,
  } = useTypingOptionsState();
  const replayRankingResult = useReplayRankingResultState();
  const { otherStatus } = replayRankingResult ?? {};
  const isCaseSensitive = otherStatus?.isCaseSensitive ?? (builtMap?.isCaseSensitive || isCaseSensitiveTypingOptions);

  const isLineCompleted = !typingWord.nextChunk.kana && !!typingWord.correct.kana;

  const kanaWordProps = {
    correct: typingWord.correct.kana,
    nextChar: typingWord.nextChunk.kana,
    word: typingWord.wordChunks
      .map((chunk) => chunk.kana)
      .join("")
      .slice(0, 60),
    isLineCompleted,
    nextWord: nextLyrics.kanaWord,
    className: cn(
      "word-kana",
      !isCaseSensitive && "lowercase",
      (wordDisplay === "ROMA_LOWERCASE_ONLY" || wordDisplay === "ROMA_UPPERCASE_ONLY") && "invisible",
      inputMode === "kana" && "visible",
    ),
  };
  const romaWordProps = {
    correct: typingWord.correct.roma,
    nextChar: typingWord.nextChunk.romaPatterns[0] ?? "",
    word: typingWord.wordChunks
      .map((chunk) => chunk.romaPatterns[0])
      .join("")
      .slice(0, 60),
    isLineCompleted,
    nextWord: nextLyrics.romaWord,
    className: cn(
      "word-roma",
      !isCaseSensitive && (wordDisplay.includes("UPPERCASE") ? "uppercase" : "lowercase"),
      inputMode === "roma" && "visible",
      (wordDisplay === "KANA_ONLY" || inputMode === "kana") && "invisible",
    ),
    style: {
      fontSize: `${subWordFontSize}%`,
      bottom: subWordTopPosition,
      letterSpacing: `${romaWordSpacing.toFixed(2)}em`,
    },
  };

  const mainWord = wordDisplay.match(/^KANA_/) || inputMode === "kana" ? "kana" : "roma";

  const style = {
    kanaLetterSpacing: `${kanaWordSpacing.toFixed(2)}em`,
    romaLetterSpacing: `${romaWordSpacing.toFixed(2)}em`,
  };

  const mainCorrect = mainWord === "kana" ? typingWord.correct.kana : typingWord.correct.roma;
  const subCorrect = mainWord === "kana" ? typingWord.correct.roma : typingWord.correct.kana;
  const { mainRefs, subRefs } = useWordScroll(
    mainCorrect,
    subCorrect,
    isSmoothScroll,
    mainWordScrollStart,
    subWordScrollStart,
  );

  return (
    <div
      className={cn(
        "w-full word-font word-outline-text text-7xl leading-24 md:text-[2.8rem] md:leading-15",
        isLineCompleted && "word-area-completed",
      )}
    >
      <Word
        id="main_word"
        {...(mainWord === "kana" ? kanaWordProps : romaWordProps)}
        style={{
          fontSize: `${mainWordFontSize}%`,
          bottom: mainWordTopPosition,
          letterSpacing: mainWord === "kana" ? style.kanaLetterSpacing : style.romaLetterSpacing,
        }}
        refs={mainRefs}
      />
      <Word
        id="sub_word"
        {...(mainWord === "kana" ? romaWordProps : kanaWordProps)}
        style={{
          fontSize: `${subWordFontSize}%`,
          bottom: subWordTopPosition,
          letterSpacing: mainWord === "kana" ? style.romaLetterSpacing : style.kanaLetterSpacing,
        }}
        refs={subRefs}
      />
    </div>
  );
};

interface WordRefs {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  caretRef: React.RefObject<HTMLSpanElement | null>;
}

interface WordProps {
  correct: string;
  nextChar: string;
  word: string;
  id: string;
  isLineCompleted: boolean;
  nextWord: string;
  refs: WordRefs;
}

const Word = ({
  correct,
  nextChar,
  word,
  isLineCompleted,
  nextWord,
  refs,
  ...rest
}: WordProps & HTMLAttributes<HTMLDivElement>) => {
  const remainWord = nextChar + word;
  const { lineCompletedDisplay } = useTypingOptionsState();
  const isNextWordDisplay = lineCompletedDisplay === "NEXT_WORD";

  return (
    <div
      {...rest}
      className={cn("relative w-full", rest.className)}
      style={{ fontSize: rest.style?.fontSize, bottom: rest.style?.bottom, letterSpacing: rest.style?.letterSpacing }}
    >
      {isLineCompleted && isNextWordDisplay ? (
        <span className="next-line-word text-word-nextWord">{nextWord.replace(/ /g, " ") || "\u200B"}</span>
      ) : (
        <div ref={refs.viewportRef} className="overflow-hidden contain-[layout_paint]">
          {"\u200B"}
          <div ref={refs.trackRef} className="inline-block will-change-transform transform-gpu backface-hidden">
            <span
              className={cn(
                "opacity-word-correct",
                remainWord.length === 0 ? "text-word-completed" : "text-word-correct",
              )}
            >
              {correct.replace(/ /g, "ˍ")}
            </span>
            <span ref={refs.caretRef} className="text-word-nextChar">
              {nextChar.replace(/ /g, " ")}
            </span>
            <span className="text-word-word">{word.replace(/ /g, " ")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const useWordScroll = (
  mainCorrect: string,
  subCorrect: string,
  isSmoothScroll: boolean,
  mainWordScrollStart: number,
  subWordScrollStart: number,
) => {
  const mainRefs = useRef({
    viewportRef: { current: null as HTMLDivElement | null },
    trackRef: { current: null as HTMLDivElement | null },
    caretRef: { current: null as HTMLSpanElement | null },
  }).current;

  const subRefs = useRef({
    viewportRef: { current: null as HTMLDivElement | null },
    trackRef: { current: null as HTMLDivElement | null },
    caretRef: { current: null as HTMLSpanElement | null },
  }).current;

  const prevMainShift = useRef(-1);
  const prevSubShift = useRef(-1);
  const DURATION = isSmoothScroll ? 80 : 0;

  const SCROLL_TRANSITION = `transform ${DURATION}ms`;
  const MAIN_RIGHT_BOUND_RATIO = mainWordScrollStart / 100;
  const SUB_RIGHT_BOUND_RATIO = subWordScrollStart / 100;

  useLayoutEffect(() => {
    // 早期リターン：レイアウト計算を回避（即座に実行、キャンセル不可）
    if (mainCorrect.length === 0 && subCorrect.length === 0) {
      requestAnimationFrame(() => {
        if (mainRefs.trackRef.current) {
          mainRefs.trackRef.current.style.transition = "";
          mainRefs.trackRef.current.style.transform = "translate3d(0px, 0px, 0px)";
          prevMainShift.current = 0;
        }
        if (subRefs.trackRef.current) {
          subRefs.trackRef.current.style.transition = "";
          subRefs.trackRef.current.style.transform = "translate3d(0px, 0px, 0px)";
          prevSubShift.current = 0;
        }
      });
      return;
    }

    const cancel = requestDebouncedAnimationFrame("word-scroll", () => {
      const mainMeasurements =
        mainCorrect.length > 0 && mainRefs.viewportRef.current && mainRefs.caretRef.current && mainRefs.trackRef.current
          ? {
              caretX: mainRefs.caretRef.current.offsetLeft,
              rightBound: Math.floor(mainRefs.viewportRef.current.clientWidth * MAIN_RIGHT_BOUND_RATIO),
            }
          : null;

      const subMeasurements =
        subCorrect.length > 0 && subRefs.viewportRef.current && subRefs.caretRef.current && subRefs.trackRef.current
          ? {
              caretX: subRefs.caretRef.current.offsetLeft,
              rightBound: Math.floor(subRefs.viewportRef.current.clientWidth * SUB_RIGHT_BOUND_RATIO),
            }
          : null;

      const mainShift = mainMeasurements
        ? mainMeasurements.caretX > mainMeasurements.rightBound
          ? Math.max(0, mainMeasurements.caretX - mainMeasurements.rightBound)
          : null
        : null;

      const subShift = subMeasurements
        ? subMeasurements.caretX > subMeasurements.rightBound
          ? Math.max(0, subMeasurements.caretX - subMeasurements.rightBound)
          : null
        : null;

      if (mainShift !== null && mainShift !== prevMainShift.current && mainRefs.trackRef.current) {
        mainRefs.trackRef.current.style.transition = SCROLL_TRANSITION;
        mainRefs.trackRef.current.style.transform = `translate3d(${-mainShift}px, 0px, 0px)`;
        prevMainShift.current = mainShift;
      }

      if (subShift !== null && subShift !== prevSubShift.current && subRefs.trackRef.current) {
        subRefs.trackRef.current.style.transition = SCROLL_TRANSITION;
        subRefs.trackRef.current.style.transform = `translate3d(${-subShift}px, 0px, 0px)`;
        prevSubShift.current = subShift;
      }
    });

    return cancel;
  }, [mainCorrect.length, subCorrect.length]);

  return { mainRefs, subRefs };
};
