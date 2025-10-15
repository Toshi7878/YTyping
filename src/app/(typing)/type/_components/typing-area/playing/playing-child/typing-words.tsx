import type { HTMLAttributes } from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  useLineWordState,
  useNextLyricsState,
  usePlayingInputModeState,
  useUserTypingOptionsState,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { cn } from "@/lib/utils";

export const TypingWords = () => {
  const lineWord = useLineWordState();
  const inputMode = usePlayingInputModeState();
  const nextLyrics = useNextLyricsState();
  const userOptions = useUserTypingOptionsState();

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
      (userOptions.wordDisplay === "ROMA_LOWERCASE_ONLY" || userOptions.wordDisplay === "ROMA_UPPERCASE_ONLY") &&
        "invisible",
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
      userOptions.wordDisplay.includes("UPPERCASE") ? "uppercase" : "lowercase",
      inputMode === "roma" && "visible",
      (userOptions.wordDisplay === "KANA_ONLY" || inputMode === "kana") && "invisible",
    ),
    style: {
      fontSize: `${userOptions.subWordFontSize}%`,
      bottom: userOptions.subWordTopPosition,
      letterSpacing: `${userOptions.romaWordSpacing.toFixed(2)}em`,
    },
  };

  const mainWord = userOptions.wordDisplay.match(/^KANA_/) || inputMode === "kana" ? "kana" : "roma";

  const style = {
    kanaLetterSpacing: `${userOptions.kanaWordSpacing.toFixed(2)}em`,
    romaLetterSpacing: `${userOptions.romaWordSpacing.toFixed(2)}em`,
  };

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
          fontSize: `${userOptions.mainWordFontSize}%`,
          bottom: userOptions.mainWordTopPosition,
          letterSpacing: mainWord === "kana" ? style.kanaLetterSpacing : style.romaLetterSpacing,
        }}
      />
      <Word
        id="sub_word"
        {...(mainWord === "kana" ? romaWordProps : kanaWordProps)}
        style={{
          fontSize: `${userOptions.subWordFontSize}%`,
          bottom: userOptions.subWordTopPosition,
          letterSpacing: mainWord === "kana" ? style.romaLetterSpacing : style.kanaLetterSpacing,
        }}
      />
    </div>
  );
};

interface WordProps {
  correct: string;
  nextChar: string;
  word: string;
  id: string;
  isLineCompleted: boolean;
  nextWord: string;
}

const Word = ({
  correct,
  nextChar,
  word,
  isLineCompleted,
  nextWord,
  ...rest
}: WordProps & HTMLAttributes<HTMLDivElement>) => {
  const remainWord = nextChar + word;
  const userOptionsAtom = useUserTypingOptionsState();
  const isNextWordDisplay = userOptionsAtom.lineCompletedDisplay === "NEXT_WORD";

  const { viewportRef, trackRef, caretRef } = useWordScroll(correct);

  return (
    <div
      {...rest}
      className={cn("relative w-full border", rest.className)}
      style={{ fontSize: rest.style?.fontSize, bottom: rest.style?.bottom, letterSpacing: rest.style?.letterSpacing }}
    >
      {isLineCompleted && isNextWordDisplay ? (
        <span className="next-line-word text-word-nextWord">{nextWord.replace(/ /g, " ")}</span>
      ) : (
        <div ref={viewportRef} className="overflow-hidden">
          <div ref={trackRef} className="inline-block will-change-transform">
            <span
              className={cn(
                "opacity-word-correct",
                remainWord.length === 0 ? "text-word-completed" : "text-word-correct",
              )}
            >
              {correct.replace(/ /g, "ˍ")}
            </span>
            <span ref={caretRef} className="text-word-nextChar">
              {nextChar.replace(/ /g, " ")}
            </span>
            <span className="text-word-word">{word.replace(/ /g, " ")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const useWordScroll = (correct: string) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const caretRef = useRef<HTMLSpanElement | null>(null);

  const recalc = useCallback(() => {
    if (!viewportRef.current || !trackRef.current || !caretRef.current) return;
    const viewportWidth = viewportRef.current.clientWidth;
    const caretViewportX = caretRef.current.offsetLeft;
    const RIGHT_BOUND = Math.floor(viewportWidth * 0.28);

    if (caretViewportX > RIGHT_BOUND) {
      const targetX = RIGHT_BOUND;

      // === 視認性重視のスクロールアニメーション ===

      // 1. バランス良く滑らか（Monkeytype系）
      // trackRef.current.style.transition = "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)";

      // 2. やわらかく自然に止まる（推奨）
      // trackRef.current.style.transition = "transform 200ms cubic-bezier(0.215, 0.61, 0.355, 1)";

      // 3. キビキビと速い動き（視認性◎）
      // trackRef.current.style.transition = "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)";

      // 4. ゆったりと滑らか *
      // trackRef.current.style.transition = "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      // 4リニア
      // trackRef.current.style.transition = "transform 300ms cubic-bezier(0.25, 0.25, 0.75, 0.75)";

      // 4中間の速さで
      // trackRef.current.style.transition = "transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      // trackRef.current.style.transition = "transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      // 6. リニア（一定速度、予測しやすい）
      // trackRef.current.style.transition = "transform 50ms linear";

      // 7. 素早く始まりゆっくり止まる（視認性◎）*
      trackRef.current.style.transition = "transform 250ms cubic-bezier(0.33, 1, 0.68, 1)";

      // 8. ease-out標準（Material Design系）
      // trackRef.current.style.transition = "transform 200ms cubic-bezier(0, 0, 0.2, 1)";

      // 9. 非常に滑らか（長めの時間）
      // trackRef.current.style.transition = "transform 350ms cubic-bezier(0.23, 1, 0.32, 1)";

      // 10. アニメーションなし（即座に移動）
      // trackRef.current.style.transition = "";

      const newShift = Math.max(0, caretRef.current.offsetLeft - targetX);
      trackRef.current.style.transform = `translateX(${-newShift}px)`;
    }
  }, []);

  useEffect(() => {
    if (trackRef.current && correct.length === 0) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = "translateX(0px)";
      return;
    }

    recalc();
  }, [correct.length, recalc]);

  return { viewportRef, trackRef, caretRef };
};
