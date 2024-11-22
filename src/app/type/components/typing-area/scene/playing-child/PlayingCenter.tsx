import { Box, useTheme, VStack } from "@chakra-ui/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import PlayingLyrics from "./child/PlayingLyrics";
import type { NextLyricsType, WordType } from "@/app/type/ts/type";
import PlayingWord from "./child/PlayingWord";
import NextLyrics from "./child/PlayingNextLyrics";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { useInputModeAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import "@/css/type.css";
import { CARD_BODY_MIN_HEIGHT } from "../../Scene";

export interface PlayingCenterRef {
  setLineWord: (newLineWord: WordType) => void;
  setLyrics: (newLyrics: string) => void;
  setNextLyrics: (params: NextLyricsType) => void;
  getLineWord: () => WordType;
  resetWordLyrics: () => void;
}

interface Props {
  flex: string;
}

export const defaultLineWord: WordType = {
  correct: { k: "", r: "" },
  nextChar: { k: "", r: [""], p: 0 },
  word: [{ k: "", r: [""], p: 0 }],
  lineCount: 0,
};

export const defaultNextLyrics: NextLyricsType = {
  lyrics: "",
  kpm: "",
};

const PlayingCenter = forwardRef<PlayingCenterRef, Props>(({ flex }, ref) => {
  const [lineWord, setLineWord] = useState(structuredClone(defaultLineWord));
  const [lyrics, setLyrics] = useState("");
  const [nextLyrics, setNextLyrics] = useState(structuredClone(defaultNextLyrics));
  const inputMode = useInputModeAtom();
  const { gameStateRef, setRef } = useRefs();

  const theme: ThemeColors = useTheme();
  useEffect(() => {
    if (ref && "current" in ref) {
      setRef("playingCenterRef", ref.current!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineWord]);

  useImperativeHandle(ref, () => ({
    setLineWord: (newLineWord) => setLineWord(newLineWord),
    setLyrics: (newLyrics) => setLyrics(newLyrics),
    setNextLyrics: (params) => setNextLyrics(params),
    getLineWord: () => lineWord,
    resetWordLyrics: () => {
      setLineWord(structuredClone(defaultLineWord));
      setLyrics("");
      setNextLyrics(structuredClone(defaultNextLyrics));
    },
  }));

  const playMode = gameStateRef.current!.playMode;

  return (
    <VStack
      className={`${playMode === "playing" ? "cursor-none" : ""}`}
      flex={flex}
      isTruncated
      ml={-2}
      align="start"
      minH={CARD_BODY_MIN_HEIGHT}
      justifyContent="space-between"
    >
      <Box
        color={theme.colors.text.body}
        fontSize="2.75rem"
        className="word-font outline-text"
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

      <PlayingLyrics lyrics={lyrics} />

      <NextLyrics lyrics={nextLyrics.lyrics} kpm={nextLyrics.kpm} />
    </VStack>
  );
});

PlayingCenter.displayName = "PlayingCenter"; // 追加

export default PlayingCenter;
