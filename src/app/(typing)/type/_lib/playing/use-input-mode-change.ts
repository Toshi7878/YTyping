import { romaConvert } from "../../../../../utils/build-map/build-map";
import { useLineCount, useLineStatus } from "../atoms/read-atoms";
import {
  useReadGameUtilParams,
  useReadLineWord,
  useReadMap,
  useSetLineWord,
  useSetNextLyrics,
  useSetNotify,
  useSetPlayingInputMode,
} from "../atoms/state-atoms";
import type { InputMode } from "../type";
import { useGetYouTubeTime } from "../youtube-player/use-get-youtube-time";

export const useInputModeChange = () => {
  const setPlayingInputMode = useSetPlayingInputMode();
  const setNotify = useSetNotify();
  const { setNextLyrics } = useSetNextLyrics();
  const setLineWord = useSetLineWord();

  const getCurrentTime = useGetYouTubeTime();
  const { readLineStatus, writeLineStatus } = useLineStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readLineWord = useReadLineWord();
  const readMap = useReadMap();
  const { readCount } = useLineCount();

  return async (newInputMode: InputMode) => {
    const map = readMap();
    if (!map) return;
    const { inputMode, scene } = readGameStateUtils();

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

    const count = readCount();
    const nextLine = map.mapData[count];

    if (nextLine.kanaWord) {
      setNextLyrics(nextLine);
    }

    if (scene === "play") {
      const { currentLineTime } = getCurrentTime({ type: "lineTime" });
      writeLineStatus({
        types: [
          ...readLineStatus().types,
          {
            op: newInputMode,
            t: Math.floor(currentLineTime * 1000) / 1000,
          },
        ],
      });
    }
  };
};
