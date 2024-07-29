import { Box, VStack } from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState } from "react";
import PlayingLyrics from "./child/PlayingLyrics";
import type { NextLyricsType, WordType } from "@/app/type/(ts)/type";
import PlayingWord from "./child/PlayingWord";
import NextLyrics from "./child/PlayingNextLyrics";
import { inputModeAtom } from "@/app/type/(atoms)/gameRenderAtoms";
import { useAtom } from "jotai";

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
  const [inputMode] = useAtom(inputModeAtom);

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

  return (
    <VStack mx="4" py="2" className="truncate cursor-none" display="" flex={flex}>
      <Box
        className="word-font outline-text text-white ml-6 mb-2 mt-1 text-[2.75rem]"
        style={{ letterSpacing: "0.1em" }}
      >
        <PlayingWord
          id="main_word"
          correct={lineWord.correct["k"].slice(-10).replace(/ /g, "ˍ")}
          nextChar={lineWord.nextChar["k"]}
          word={lineWord.word.map((w) => w["k"]).join("")}
          className="lowercase"
        />

        <PlayingWord
          id="sub_word"
          correct={lineWord.correct["r"].slice(-16).replace(/ /g, "ˍ")}
          nextChar={lineWord.nextChar["r"][0]}
          word={lineWord.word.map((w) => w["r"][0]).join("")}
          className={`uppercase ml-1 ${inputMode === "kana" ? "invisible" : ""}`}
        />
      </Box>

      <PlayingLyrics
        lyrics={lyrics}
        className="-indent-1 mb-4 font-bold text-[2.75rem] text-truncate lyrics-font"
      />

      <NextLyrics
        className={"text-gray-400 ml-3 text-3xl lyrics-font"}
        lyrics={nextLyrics.lyrics}
        kpm={nextLyrics.kpm}
      />
    </VStack>
  );
});

PlayingCenter.displayName = "PlayingCenter"; // 追加

export default PlayingCenter;
