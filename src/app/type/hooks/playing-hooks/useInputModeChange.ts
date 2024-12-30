import { useStore } from "jotai";
import { romaConvert } from "../../../../lib/instanceMapData";
import { InputModeType } from "../../ts/type";
import {
  lineWordAtom,
  playingInputModeAtom,
  sceneAtom,
  speedAtom,
  useMapAtom,
  userOptionsAtom,
  useSetLineWordAtom,
  useSetNextLyricsAtom,
  useSetPlayingInputModeAtom,
  useSetPlayingNotifyAtom,
} from "../../type-atoms/gameRenderAtoms";
import { useRefs } from "../../type-contexts/refsProvider";
import { useGetTime } from "../useGetTime";

export const useInputModeChange = () => {
  const { statusRef } = useRefs();

  const map = useMapAtom();
  const typeAtomStore = useStore();

  const setPlayingInputMode = useSetPlayingInputModeAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();
  const setLineWord = useSetLineWordAtom();

  return async (newInputMode: InputModeType) => {
    const playingInputMode = typeAtomStore.get(playingInputModeAtom);

    if (newInputMode === playingInputMode) {
      return;
    }

    setPlayingInputMode(newInputMode);

    if (newInputMode === "kana") {
      setNotify(Symbol("KanaMode"));
    } else {
      setNotify(Symbol("Romaji"));
      const lineWord = typeAtomStore.get(lineWordAtom);

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

    const count = statusRef.current!.status.count;
    const nextLine = map!.mapData[count];
    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const nextKpm =
      (newInputMode === "roma" ? map!.mapData[count].kpm["r"] : map!.mapData[count].kpm["k"]) *
      playSpeed;
    if (nextKpm) {
      const userOptions = typeAtomStore.get(userOptionsAtom);

      setNextLyrics({
        lyrics: userOptions.nextDisplay === "word" ? nextLine.kanaWord : nextLine["lyrics"],
        kpm: nextKpm.toFixed(0),
      });
    }

    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "playing") {
      const lineTime = getCurrentLineTime(await getCurrentOffsettedYTTime());

      statusRef.current!.lineStatus.typeResult.push({
        op: newInputMode,
        t: Math.round(lineTime * 1000) / 1000,
      });
    }
  };
};
