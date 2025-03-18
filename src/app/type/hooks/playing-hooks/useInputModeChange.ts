import { romaConvert } from "../../../../lib/instanceMapData";
import { usePlaySpeedStateRef } from "../../atoms/reducerAtoms";
import { useLineStatusRef, useStatusRef } from "../../atoms/refAtoms";
import {
  useLineWordStateRef,
  useMapStateRef,
  usePlayingInputModeStateRef,
  useSceneStateRef,
  useSetLineWordState,
  useSetNextLyricsState,
  useSetNotifyState,
  useSetPlayingInputModeState,
  useUserTypingOptionsStateRef,
} from "../../atoms/stateAtoms";
import { InputModeType } from "../../ts/type";
import { useGetTime } from "../useGetTime";

export const useInputModeChange = () => {
  const setPlayingInputMode = useSetPlayingInputModeState();
  const setNotify = useSetNotifyState();
  const setNextLyrics = useSetNextLyricsState();
  const setLineWord = useSetLineWordState();

  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();
  const { readLineStatusRef, writeLineStatusRef } = useLineStatusRef();
  const { readStatusRef } = useStatusRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();
  const readLineWord = useLineWordStateRef();
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readMap = useMapStateRef();

  return async (newInputMode: InputModeType) => {
    const map = readMap();
    const playingInputMode = readPlayingInputMode();

    if (newInputMode === playingInputMode) {
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
          lineCount: lineWord.lineCount,
        });
      }
    }

    const count = readStatusRef().count;
    const nextLine = map.mapData[count];
    const playSpeed = readPlaySpeed().playSpeed;

    const nextKpm =
      (newInputMode === "roma" ? map.mapData[count].kpm["r"] : map.mapData[count].kpm["k"]) * playSpeed;
    if (nextKpm) {
      const userOptions = readTypingOptions();

      setNextLyrics({
        lyrics: userOptions.next_display === "WORD" ? nextLine.kanaWord : nextLine["lyrics"],
        kpm: nextKpm.toFixed(0),
        kanaWord: nextLine.kanaWord.slice(0, 60),
        romaWord: nextLine.word
          .map((w) => w["r"][0])
          .join("")
          .slice(0, 60),
      });
    }

    const scene = readScene();

    if (scene === "playing") {
      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
      writeLineStatusRef({
        typeResult: [
          ...readLineStatusRef().typeResult,
          {
            op: newInputMode,
            t: Math.round(lineTime * 1000) / 1000,
          },
        ],
      });
    }
  };
};
