import { recreateTypingWord } from "lyrics-typing-engine";
import { readLineCount, readLineSubstatus, writeLineSubstatus } from "../../atoms/ref";
import { getBuiltMap, readUtilityParams, setNotify, setPlayingInputMode } from "../../atoms/state";
import { getTypingWord, setTypingWord } from "../../atoms/typing-word";
import { getLineTime } from "../../youtube/get-youtube-time";
import { setNextLyricsAndKpm } from "./next-lyrics";

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
        option: newInputMode,
        time: Math.floor(currentLineTime * 1000) / 1000,
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
  const typingWord = getTypingWord();

  setTypingWord(recreateTypingWord(typingWord));

  updateNextLyrics();
};

const updateNextLyrics = () => {
  const map = getBuiltMap();
  if (!map) return;

  const count = readLineCount();
  const nextLine = map.lines[count + 1];

  if (nextLine?.kanaLyrics) {
    setNextLyricsAndKpm(nextLine);
  }
};
