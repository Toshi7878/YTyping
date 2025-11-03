import { generateTypingWord } from "@/lib/build-map/generate-typing-word";
import { kanaSentenceToKanaChunkWords } from "@/lib/build-map/kana-sentence-to-kana-word-chunks";
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
import type { InputMode, LineWord } from "../type";
import { useGetYouTubeTime } from "../youtube-player/use-get-youtube-time";

export const useInputModeChange = () => {
  const getCurrentTime = useGetYouTubeTime();

  return async (newInputMode: InputMode) => {
    const map = readBuiltMap();
    if (!map) return;
    const { inputMode, scene } = readUtilityParams();

    if (newInputMode === inputMode) {
      return;
    }

    setPlayingInputMode(newInputMode);

    if (newInputMode === "kana") {
      setNotify(Symbol("KanaMode"));
    } else {
      setNotify(Symbol("Romaji"));
      const lineWord = readLineWord();

      if (lineWord.nextChar.k) {
        const wordFix = romaConvert(lineWord);
        setLineWord({
          correct: lineWord.correct,
          nextChar: wordFix.nextChar,
          word: wordFix.word,
        });
      }
    }

    const count = readLineCount();
    const nextLine = map.mapData[count + 1];

    if (nextLine?.kanaWord) {
      setNextLyrics(nextLine);
    }

    if (scene === "play") {
      const { currentLineTime } = getCurrentTime({ type: "lineTime" });
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
    }
  };
};

function romaConvert(lineWord: LineWord) {
  const dakuten = lineWord.nextChar.orginalDakuChar;
  const [kanaChunkWord] = kanaSentenceToKanaChunkWords(
    (dakuten ? dakuten : lineWord.nextChar.k) + lineWord.word.map((char) => char.k).join(""),
  );

  const nextPoint = lineWord.nextChar.p;
  const word = generateTypingWord(kanaChunkWord!);
  const nextChar = word[0]!;
  return { nextChar: { ...nextChar, p: nextPoint }, word: word.slice(1) };
}
