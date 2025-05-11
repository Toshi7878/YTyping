import { romaConvert } from "../../../../util/parse-map/parseMap";
import { useLineCount, useLineStatus } from "../../atoms/refAtoms";
import {
  useReadGameUtilParams,
  useReadLineWord,
  useReadMapState,
  useSetLineWord,
  useSetNextLyrics,
  useSetNotify,
  useSetPlayingInputMode,
} from "../../atoms/stateAtoms";
import { InputMode } from "../../ts/type";
import { useGetTime } from "./getYTTime";

export const useInputModeChange = () => {
  const setPlayingInputMode = useSetPlayingInputMode();
  const setNotify = useSetNotify();
  const { setNextLyrics } = useSetNextLyrics();
  const setLineWord = useSetLineWord();

  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();
  const { readLineStatus, writeLineStatus } = useLineStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readLineWord = useReadLineWord();
  const readMap = useReadMapState();
  const { readCount } = useLineCount();

  return async (newInputMode: InputMode) => {
    const map = readMap();
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

      if (lineWord.nextChar["k"]) {
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
      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
      writeLineStatus({
        typeResult: [
          ...readLineStatus().typeResult,
          {
            op: newInputMode,
            t: Math.floor(lineTime * 1000) / 1000,
          },
        ],
      });
    }
  };
};
