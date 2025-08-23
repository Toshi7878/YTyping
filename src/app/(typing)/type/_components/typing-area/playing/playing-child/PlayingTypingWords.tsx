import {
  useLineWordState,
  useNextLyricsState,
  usePlayingInputModeState,
  useUserTypingOptionsState,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const TypingWords = () => {
  const lineWord = useLineWordState();
  const inputMode = usePlayingInputModeState();
  const nextLyrics = useNextLyricsState();
  const userOptions = useUserTypingOptionsState();

  const isLineCompleted = !lineWord.nextChar.k && !!lineWord.correct.k;
  const kanaScroll = userOptions.kana_word_scroll > 0 ? userOptions.kana_word_scroll : 0;
  const romaScroll = userOptions.roma_word_scroll > 0 ? userOptions.roma_word_scroll : 0;

  const [kanaCorrectSlice, setKanaCorrectSlice] = useState(5);
  const [romaCorrectSlice, setRomaCorrectSlice] = useState(8);

  useEffect(() => {
    const handleResize = () => {
      setKanaCorrectSlice(window.innerWidth >= 768 ? kanaScroll : 5);
      setRomaCorrectSlice(window.innerWidth >= 768 ? romaScroll : 8);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [kanaScroll, romaScroll]);

  return (
    <div
      className={cn(
        "word-font outline-text text-6xl leading-20 md:text-[2.6rem] md:leading-15",
        isLineCompleted && "word-area-completed",
      )}
      style={{ letterSpacing: "0.08em" }}
    >
      <Word
        id="main_word"
        correct={lineWord.correct["k"].substr(-kanaCorrectSlice, kanaCorrectSlice).replace(/ /g, "ˍ")}
        nextChar={lineWord.nextChar["k"]}
        word={lineWord.word
          .map((w) => w["k"])
          .join("")
          .slice(0, 60)}
        isLineCompleted={isLineCompleted}
        nextWord={nextLyrics.kanaWord}
        className="word-kana lowercase"
        style={{ fontSize: `${userOptions.kana_word_font_size}%`, bottom: userOptions.kana_word_top_position }}
      />

      <Word
        id="sub_word"
        correct={lineWord.correct["r"].substr(-romaCorrectSlice, romaCorrectSlice).replace(/ /g, "ˍ")}
        nextChar={lineWord.nextChar["r"][0]}
        word={lineWord.word
          .map((w) => w["r"][0])
          .join("")
          .slice(0, 60)}
        className={cn("word-roma uppercase", inputMode === "kana" && "invisible")}
        isLineCompleted={isLineCompleted}
        nextWord={nextLyrics.romaWord}
        style={{ fontSize: `${userOptions.roma_word_font_size}%`, bottom: userOptions.roma_word_top_position }}
      />
    </div>
  );
};

import { HTMLAttributes } from "react";

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
  const isNextWordDisplay = userOptionsAtom.line_completed_display === "NEXT_WORD";

  return (
    <div
      {...rest}
      className={cn("relative", rest.className)}
      style={{ fontSize: rest.style?.fontSize, bottom: rest.style?.bottom }}
    >
      {isLineCompleted && isNextWordDisplay ? (
        <span className="next-line-word text-word-nextWord">{nextWord}</span>
      ) : (
        <>
          <span className={cn(remainWord.length === 0 ? "text-word-completed" : "text-word-correct")}>{correct}</span>
          <span className="text-word-nextChar">{nextChar}</span>
          <span className="text-word-word">{word}</span>
        </>
      )}
    </div>
  );
};

export default TypingWords;
