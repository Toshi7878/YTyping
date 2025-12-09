import { createTypingWord, parseWordToChunks } from "lyrics-typing-engine";
import { readLineCount, readLineSubstatus, writeLineSubstatus } from "../atoms/ref";
import { readBuiltMap, readUtilityParams, setNotify, setPlayingInputMode } from "../atoms/state";
import { readTypingWord, setNextLyrics, setTypingWord } from "../atoms/typing-word";
import { CHAR_POINT } from "../const";
import { getLineTime } from "../youtube-player/get-youtube-time";

export const togglePlayInputMode = () => {
  const { inputMode } = readUtilityParams();

  const newInputMode = inputMode === "kana" ? "roma" : "kana";

  if (newInputMode === "kana") {
    applyKanaInputMode();
  } else {
    applyRomaInputMode();
  }

  const { currentLineTime } = getLineTime();
  const { types } = readLineSubstatus();
  writeLineSubstatus({
    types: [
      ...types,
      {
        op: newInputMode,
        t: Math.floor(currentLineTime * 1000) / 1000,
      },
    ],
  });
};

export const applyKanaInputMode = () => {
  setPlayingInputMode("kana");
  setNotify(Symbol("KanaMode"));
  updateNextLyrics();
};

export const applyRomaInputMode = () => {
  setPlayingInputMode("roma");
  setNotify(Symbol("Romaji"));
  const typingWord = readTypingWord();

  if (typingWord.nextChunk.kana) {
    const reconstructedWord =
      (typingWord.nextChunk.originalDakutenChar ?? typingWord.nextChunk.kana) +
      typingWord.wordChunks.map((chunk) => chunk.kana).join("");

    const wordChunks = parseWordToChunks({ word: reconstructedWord, charPoint: CHAR_POINT });
    setTypingWord(createTypingWord({ wordChunks }, typingWord.correct));
  }

  updateNextLyrics();
};

const updateNextLyrics = () => {
  const map = readBuiltMap();
  if (!map) return;

  const count = readLineCount();
  const nextLine = map.lines[count + 1];

  if (nextLine?.kanaLyrics) {
    setNextLyrics(nextLine);
  }
};
