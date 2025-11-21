import { generateTypingWord } from "@/lib/build-map/generate-typing-word";
import { sentenceToKanaChunkWords } from "@/lib/build-map/sentence-to-kana-chunk-words";
import { readLineCount, readLineSubstatus, writeLineSubstatus } from "../atoms/ref";
import {
  readBuiltMap,
  readLineWord,
  readUtilityParams,
  setLineWord,
  setNextLyrics,
  setNotify,
  setPlayingInputMode,
} from "../atoms/state";
import type { LineWord } from "../type";
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
  const lineWord = readLineWord();

  if (lineWord.nextChar.kana) {
    const wordFix = romaConvert(lineWord);
    if (!wordFix) return;
    setLineWord({
      correct: lineWord.correct,
      nextChar: wordFix.nextChar,
      word: wordFix.word,
    });
  }
  updateNextLyrics();
};

const updateNextLyrics = () => {
  const map = readBuiltMap();
  if (!map) return;

  const count = readLineCount();
  const nextLine = map.lines[count + 1];

  if (nextLine?.kanaWord) {
    setNextLyrics(nextLine);
  }
};

function romaConvert(lineWord: LineWord) {
  const dakuten = lineWord.nextChar.orginalDakuChar;
  const [kanaChunkWord] = sentenceToKanaChunkWords(
    (dakuten ? dakuten : lineWord.nextChar.kana) + lineWord.word.map((char) => char.kana).join(""),
  );

  if (!kanaChunkWord) return;
  const nextPoint = lineWord.nextChar.point;
  const word = generateTypingWord(kanaChunkWord);
  const nextChar = word[0];
  if (!nextChar) return;
  return { nextChar: { ...nextChar, point: nextPoint }, word: word.slice(1) };
}
