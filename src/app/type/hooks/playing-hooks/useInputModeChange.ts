import { romaConvert } from "../../../../lib/parseMap";
import { useCountRef, useLineStatusRef } from "../../atoms/refAtoms";
import {
  useGameStateUtilsRef,
  useLineWordStateRef,
  useMapStateRef,
  useSetLineWordState,
  useSetNextLyricsState,
  useSetNotifyState,
  useSetPlayingInputModeState,
} from "../../atoms/stateAtoms";
import { InputMode } from "../../ts/type";
import { useGetTime } from "./useGetTime";

export const useInputModeChange = () => {
  const setPlayingInputMode = useSetPlayingInputModeState();
  const setNotify = useSetNotifyState();
  const { setNextLyrics } = useSetNextLyricsState();
  const setLineWord = useSetLineWordState();

  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();
  const { readLineStatus, writeLineStatus } = useLineStatusRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const readLineWord = useLineWordStateRef();
  const readMap = useMapStateRef();
  const { readCount } = useCountRef();

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

    if (scene === "playing") {
      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
      writeLineStatus({
        typeResult: [
          ...readLineStatus().typeResult,
          {
            op: newInputMode,
            t: Math.round(lineTime * 1000) / 1000,
          },
        ],
      });
    }
  };
};
