import {
  useLineWordAtom,
  useNextLyricsAtom,
  usePlayingInputModeAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Box, useBreakpointValue, useTheme } from "@chakra-ui/react";
import PlayingWord from "./PlayingWord";

const PlayingTypingWords = () => {
  const lineWord = useLineWordAtom();
  const inputMode = usePlayingInputModeAtom();
  const nextLyrics = useNextLyricsAtom();
  const theme: ThemeColors = useTheme();

  const isLineCompleted = !lineWord.nextChar.k && !!lineWord.correct.k;
  const kanaCorrectSlice = useBreakpointValue({ base: -5, md: -10 });
  const romaCorrectSlice = useBreakpointValue({ base: -8, md: -16 });
  return (
    <Box
      color={theme.colors.text.body}
      fontSize={{ base: "5.5rem", sm: "4rem", md: "2.75rem" }}
      className={`word-font outline-text ${isLineCompleted ? "word-area-completed" : ""}`}
      style={{ letterSpacing: "0.1em" }}
    >
      <PlayingWord
        id="main_word"
        correct={lineWord.correct["k"].slice(kanaCorrectSlice).replace(/ /g, "ˍ")}
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
        correct={lineWord.correct["r"].slice(romaCorrectSlice).replace(/ /g, "ˍ")}
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
