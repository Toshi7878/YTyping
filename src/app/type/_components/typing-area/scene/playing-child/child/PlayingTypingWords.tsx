import {
  useLineWordState,
  useNextLyricsState,
  usePlayingInputModeState,
  useUserTypingOptionsState,
} from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { Box, useBreakpointValue, useTheme } from "@chakra-ui/react";
import PlayingWord from "./PlayingWord";

const PlayingTypingWords = () => {
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
      <PlayingWord
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

      <PlayingWord
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

export default PlayingTypingWords;
