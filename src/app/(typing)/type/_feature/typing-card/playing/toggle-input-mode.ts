import { recreateTypingWord } from "lyrics-typing-engine";
import { getBuiltMap } from "../../atoms/built-map";
import { getLineSubstatus, setLineSubstatus } from "../../atoms/line-substatus";
import { getPlayingInputMode, getTypingWord, setPlayingInputMode, setTypingWord } from "../../atoms/typing-word";
import { getLineTime } from "../../youtube/get-youtube-time";
import { setNotify } from "../header/notify";
import { setNextLyricsAndKpm } from "./next-lyrics";
import { getLineCount } from "./playing-scene";

export const togglePlayInputMode = () => {
  const inputMode = getPlayingInputMode();

  const newInputMode = inputMode === "kana" ? "roma" : "kana";

  if (newInputMode === "kana") {
    applyKanaInputMode();
  } else {
    applyRomaInputMode();
  }

  const { currentLineTime } = getLineTime();
  const { types } = getLineSubstatus();
  setLineSubstatus({
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

  const count = getLineCount();
  const nextLine = map.lines[count + 1];

  if (nextLine?.kanaLyrics) {
    setNextLyricsAndKpm(nextLine);
  }
};
