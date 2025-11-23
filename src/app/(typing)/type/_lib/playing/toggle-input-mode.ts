import { parseKanaChunks, parseKanaToWordChunks, type TypingWordState } from "lyrics-typing-engine";
import { readLineCount, readLineSubstatus, writeLineSubstatus } from "../atoms/ref";
import {
  readBuiltMap,
  readTypingWord,
  readUtilityParams,
  setNextLyrics,
  setNotify,
  setPlayingInputMode,
  setTypingWord,
} from "../atoms/state";
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
  const lineWord = readTypingWord();

  if (lineWord.nextChunk.kana) {
    const wordFix = romaConvert(lineWord);
    if (!wordFix) return;
    setTypingWord({
      correct: lineWord.correct,
      nextChunk: wordFix.nextChunk,
      wordChunks: wordFix.wordChunks,
    });
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

function romaConvert(wordState: TypingWordState) {
  const dakuten = wordState.nextChunk.orginalDakuChar;
  const [kanaChunks] = parseKanaChunks(
    (dakuten ? dakuten : wordState.nextChunk.kana) + wordState.wordChunks.map((char) => char.kana).join(""),
  );

  if (!kanaChunks) return;
  const nextPoint = wordState.nextChunk.point;
  const wordChunks = parseKanaToWordChunks({ kanaChunks, charPoint: CHAR_POINT });
  const nextChunk = wordChunks[0];
  if (!nextChunk) return;
  return { nextChunk: { ...nextChunk, point: nextPoint }, wordChunks: wordChunks.slice(1) };
}
