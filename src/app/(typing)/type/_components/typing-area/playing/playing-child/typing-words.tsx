import type { HTMLAttributes } from "react";
import { useEffect, useState } from "react";
import {
  useLineWordState,
  useNextLyricsState,
  usePlayingInputModeState,
  useUserTypingOptionsState,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { cn } from "@/lib/utils";

const TypingWords = () => {
  const lineWord = useLineWordState();
  const inputMode = usePlayingInputModeState();
  const nextLyrics = useNextLyricsState();
  const userOptions = useUserTypingOptionsState();

  const isLineCompleted = !lineWord.nextChar.k && !!lineWord.correct.k;
  const kanaScroll = userOptions.kanaWordScroll > 0 ? userOptions.kanaWordScroll : 0;
  const romaScroll = userOptions.romaWordScroll > 0 ? userOptions.romaWordScroll : 0;

  const [kanaCorrectSlice, setKanaCorrectSlice] = useState(userOptions.kanaWordScroll);
  const [romaCorrectSlice, setRomaCorrectSlice] = useState(userOptions.romaWordScroll);

  useEffect(() => {
    const handleResize = () => {
      setKanaCorrectSlice(window.innerWidth >= 768 ? kanaScroll : 7);
      setRomaCorrectSlice(window.innerWidth >= 768 ? romaScroll : 10);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [kanaScroll, romaScroll]);

  const kanaWordProps = {
    correct: lineWord.correct.k.substr(-kanaCorrectSlice, kanaCorrectSlice),
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
    style: {
      fontSize: `${userOptions.kanaWordFontSize}%`,
      bottom: userOptions.kanaWordTopPosition,
      letterSpacing: `${userOptions.kanaWordSpacing.toFixed(2)}em`,
    },
  };
  const romaWordProps = {
    correct: lineWord.correct.r.substr(-romaCorrectSlice, romaCorrectSlice),
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
      fontSize: `${userOptions.romaWordFontSize}%`,
      bottom: userOptions.romaWordTopPosition,
      letterSpacing: `${userOptions.romaWordSpacing.toFixed(2)}em`,
    },
  };

  return (
    <div
      className={cn(
        "word-font word-outline-text text-7xl leading-24 md:text-[2.6rem] md:leading-15",
        isLineCompleted && "word-area-completed",
      )}
    >
      <Word
        id="main_word"
        {...(userOptions.wordDisplay.match(/^KANA_/) || inputMode === "kana" ? kanaWordProps : romaWordProps)}
      />
      <Word
        id="sub_word"
        {...(userOptions.wordDisplay.match(/^KANA_/) || inputMode === "kana" ? romaWordProps : kanaWordProps)}
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

  return (
    <div
      {...rest}
      className={cn("relative", rest.className)}
      style={{ fontSize: rest.style?.fontSize, bottom: rest.style?.bottom, letterSpacing: rest.style?.letterSpacing }}
    >
      {isLineCompleted && isNextWordDisplay ? (
        <span className="next-line-word text-word-nextWord">{nextWord.replace(/ /g, " ")}</span>
      ) : (
        <>
          <span
            className={cn(
              "opacity-word-correct",
              remainWord.length === 0 ? "text-word-completed" : "text-word-correct",
            )}
          >
            {correct.replace(/ /g, "ˍ")}
          </span>
          <span className="text-word-nextChar">{nextChar.replace(/ /g, " ")}</span>
          <span className="text-word-word">{word.replace(/ /g, " ")}</span>
        </>
      )}
    </div>
  );
};

export default TypingWords;
