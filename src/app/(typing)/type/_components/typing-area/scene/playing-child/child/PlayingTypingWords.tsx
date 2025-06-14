import {
  useLineWordState,
  useNextLyricsState,
  usePlayingInputModeState,
  useUserTypingOptionsState,
} from "@/app/(typing)/type/atoms/stateAtoms";
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
      className={`word-font outline-text text-[5.5rem] sm:text-[4rem] md:text-[2.75rem] ${isLineCompleted ? "word-area-completed" : ""}`}
      style={{ letterSpacing: "0.1em", }}
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
        className="lowercase word-kana"
        style={{ fontSize: `${userOptions.kana_word_font_size}%`, bottom: userOptions.kana_word_top_position  }}
      />

      <Word
        id="sub_word"
        correct={lineWord.correct["r"].substr(-romaCorrectSlice, romaCorrectSlice).replace(/ /g, "ˍ")}
        nextChar={lineWord.nextChar["r"][0]}
        word={lineWord.word
          .map((w) => w["r"][0])
          .join("")
          .slice(0, 60)}
        className={`uppercase word-roma ${inputMode === "kana" ? "invisible" : ""}`}
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

const Word = ({ correct, nextChar, word, isLineCompleted, nextWord, ...rest }: WordProps & HTMLAttributes<HTMLDivElement>) => {
  const remainWord = nextChar + word;
  const userOptionsAtom = useUserTypingOptionsState();
  const isNextWordDisplay = userOptionsAtom.line_completed_display === "NEXT_WORD";

  return (
    <div {...rest} className={`relative ${rest.className || ""}`} style={{ fontSize: rest.style?.fontSize, bottom: rest.style?.bottom }}>
      {isLineCompleted && isNextWordDisplay ? (
        <span className="next-line-word" style={{ color: "#22c55e" }}>
          {nextWord}
        </span>
      ) : (
        <>
          <span
            style={{ color: remainWord.length === 0 ? "#3b82f6" : "#64748b" }}
            className={remainWord.length === 0 ? "word-completed" : "word-correct"}
          >
            {correct}
          </span>
          <span style={{ color: "#fff" }} className="word-next">
            {nextChar}
          </span>
          <span style={{ color: "#fff" }} className="word">
            {word}
          </span>
        </>
      )}
    </div>
  );
};

export default TypingWords;
