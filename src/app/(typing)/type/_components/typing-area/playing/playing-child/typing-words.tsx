import type { HTMLAttributes } from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  useLineWordState,
  useNextLyricsState,
  usePlayingInputModeState,
  useUserTypingOptionsState,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { cn } from "@/lib/utils";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";

export const TypingWords = () => {
  const lineWord = useLineWordState();
  const inputMode = usePlayingInputModeState();
  const nextLyrics = useNextLyricsState();
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
  } = useUserTypingOptionsState();

  const isLineCompleted = !lineWord.nextChar.k && !!lineWord.correct.k;

  const kanaWordProps = {
    correct: lineWord.correct.k,
    nextChar: lineWord.nextChar.k,
    word: lineWord.word
      .map((w) => w.k)
      .join("")
      .slice(0, 60),
    isLineCompleted,
    nextWord: nextLyrics.kanaWord,
    className: cn(
      "word-kana lowercase",
      (wordDisplay === "ROMA_LOWERCASE_ONLY" || wordDisplay === "ROMA_UPPERCASE_ONLY") && "invisible",
      inputMode === "kana" && "visible",
    ),
  };
  const romaWordProps = {
    correct: lineWord.correct.r,
    nextChar: lineWord.nextChar.r[0],
    word: lineWord.word
      .map((w) => w.r[0])
      .join("")
      .slice(0, 60),
    isLineCompleted,
    nextWord: nextLyrics.romaWord,
    className: cn(
      "word-roma",
      wordDisplay.includes("UPPERCASE") ? "uppercase" : "lowercase",
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

  const mainCorrect = mainWord === "kana" ? lineWord.correct.k : lineWord.correct.r;
  const subCorrect = mainWord === "kana" ? lineWord.correct.r : lineWord.correct.k;
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
  const { lineCompletedDisplay } = useUserTypingOptionsState();
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
        <div ref={refs.viewportRef} className="overflow-hidden">
          {"\u200B"}
          <div ref={refs.trackRef} className="inline-block will-change-transform translate-z-0">
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
  const mainRefs = useMemo(
    () => ({
      viewportRef: { current: null as HTMLDivElement | null },
      trackRef: { current: null as HTMLDivElement | null },
      caretRef: { current: null as HTMLSpanElement | null },
    }),
    [],
  );

  const subRefs = useMemo(
    () => ({
      viewportRef: { current: null as HTMLDivElement | null },
      trackRef: { current: null as HTMLDivElement | null },
      caretRef: { current: null as HTMLSpanElement | null },
    }),
    [],
  );

  const prevMainShift = useRef(-1);
  const prevSubShift = useRef(-1);
  const DURATION = isSmoothScroll ? 80 : 0;

  const SCROLL_TRANSITION = `transform ${DURATION}ms`;
  const MAIN_RIGHT_BOUND_RATIO = mainWordScrollStart / 100;
  const SUB_RIGHT_BOUND_RATIO = subWordScrollStart / 100;

  useEffect(() => {
    const cancel = requestDebouncedAnimationFrame("word-scroll", () => {
      if (mainCorrect.length === 0 && subCorrect.length === 0) {
        if (mainRefs.trackRef.current) {
          mainRefs.trackRef.current.style.transition = "";
          mainRefs.trackRef.current.style.transform = "translateX(0px)";
          prevMainShift.current = 0;
        }
        if (subRefs.trackRef.current) {
          subRefs.trackRef.current.style.transition = "";
          subRefs.trackRef.current.style.transform = "translateX(0px)";
          prevSubShift.current = 0;
        }

        return;
      }

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

      if (mainMeasurements && mainRefs.trackRef.current) {
        if (mainMeasurements.caretX > mainMeasurements.rightBound) {
          const newShift = Math.max(0, mainMeasurements.caretX - mainMeasurements.rightBound);
          if (newShift !== prevMainShift.current) {
            mainRefs.trackRef.current.style.transition = SCROLL_TRANSITION;
            mainRefs.trackRef.current.style.transform = `translateX(${-newShift}px)`;
            prevMainShift.current = newShift;
          }
        }
      }

      if (subMeasurements && subRefs.trackRef.current) {
        if (subMeasurements.caretX > subMeasurements.rightBound) {
          const newShift = Math.max(0, subMeasurements.caretX - subMeasurements.rightBound);
          if (newShift !== prevSubShift.current) {
            subRefs.trackRef.current.style.transition = SCROLL_TRANSITION;
            subRefs.trackRef.current.style.transform = `translateX(${-newShift}px)`;
            prevSubShift.current = newShift;
          }
        }
      }
    });

    // コンポーネントアンマウント時にフレームをキャンセル
    return cancel;
  }, [mainCorrect.length, subCorrect.length]);

  return { mainRefs, subRefs };
};
