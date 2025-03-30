import {
  useLineWordState,
  useNextLyricsState,
  usePlayingInputModeState,
  useUserTypingOptionsState,
} from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { Box, useBreakpointValue, useTheme } from "@chakra-ui/react";

const TypingWords = () => {
  const lineWord = useLineWordState();
  const inputMode = usePlayingInputModeState();
  const nextLyrics = useNextLyricsState();
  const theme: ThemeColors = useTheme();
  const userOptionsAtom = useUserTypingOptionsState();

  const isLineCompleted = !lineWord.nextChar.k && !!lineWord.correct.k;
  const kanaScroll = userOptionsAtom.kana_word_scroll > 0 ? userOptionsAtom.kana_word_scroll : 0;
  const romaScroll = userOptionsAtom.roma_word_scroll > 0 ? userOptionsAtom.roma_word_scroll : 0;
  const kanaCorrectSlice = useBreakpointValue({ base: 5, md: kanaScroll }) as number;
  const romaCorrectSlice = useBreakpointValue({ base: 8, md: romaScroll }) as number;
  return (
    <Box
      color={theme.colors.text.body}
      fontSize={{ base: "5.5rem", sm: "4rem", md: "2.75rem" }}
      className={`word-font outline-text ${isLineCompleted ? "word-area-completed" : ""}`}
      style={{ letterSpacing: "0.1em" }}
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
      />
    </Box>
  );
};

import { BoxProps, Text } from "@chakra-ui/react";

interface WordProps {
  correct: string;
  nextChar: string;
  word: string;
  id: string;
  isLineCompleted: boolean;
  nextWord: string;
}

const Word = ({ correct, nextChar, word, isLineCompleted, nextWord, ...rest }: WordProps & BoxProps) => {
  const remainWord = nextChar + word;
  const theme: ThemeColors = useTheme();
  const userOptionsAtom = useUserTypingOptionsState();
  const isNextWordDisplay = userOptionsAtom.line_completed_display === "NEXT_WORD";

  return (
    <Box {...rest}>
      {isLineCompleted && isNextWordDisplay ? (
        <Text as="span" className="next-line-word" color={theme.colors.semantic.word.nextWord}>
          {nextWord}
        </Text>
      ) : (
        <>
          <Text
            as="span"
            color={remainWord.length === 0 ? theme.colors.semantic.word.completed : theme.colors.semantic.word.correct}
            className={remainWord.length === 0 ? "word-completed" : "word-correct"}
          >
            {correct}
          </Text>
          <Text as="span" color={theme.colors.semantic.word.nextChar} className="word-next">
            {nextChar}
          </Text>
          <Text as="span" color={theme.colors.semantic.word.word} className="word">
            {word}
          </Text>
        </>
      )}
    </Box>
  );
};

export default TypingWords;
