import { useLineWordAtom, usePlayingInputModeAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";
import PlayingWord from "./PlayingWord";

const PlayingTypingWords = () => {
  const lineWord = useLineWordAtom();
  const inputMode = usePlayingInputModeAtom();
  const theme: ThemeColors = useTheme();

  const lineCompleted = !lineWord.nextChar.k && lineWord.correct.k;
  return (
    <Box
      color={theme.colors.text.body}
      fontSize="2.75rem"
      className={`word-font outline-text ${lineCompleted ? "word-area-completed" : ""}`}
      style={{ letterSpacing: "0.1em" }}
    >
      <PlayingWord
        id="main_word"
        correct={lineWord.correct["k"].slice(-10).replace(/ /g, "ˍ")}
        nextChar={lineWord.nextChar["k"]}
        word={lineWord.word.map((w) => w["k"]).join("")}
        className="lowercase word-kana"
      />

      <PlayingWord
        id="sub_word"
        correct={lineWord.correct["r"].slice(-16).replace(/ /g, "ˍ")}
        nextChar={lineWord.nextChar["r"][0]}
        word={lineWord.word.map((w) => w["r"][0]).join("")}
        className={`uppercase word-roma ${inputMode === "kana" ? "invisible" : ""}`}
      />
    </Box>
  );
};

export default PlayingTypingWords;
