import { useStore } from "jotai";
import { romaConvert } from "../../../../lib/instanceMapData";
import { useLineStatusRef, useStatusRef } from "../../atoms/refAtoms";
import {
  lineWordAtom,
  playingInputModeAtom,
  sceneAtom,
  speedAtom,
  useMapAtom,
  userTypingOptionsAtom,
  useSetLineWordAtom,
  useSetNextLyricsAtom,
  useSetPlayingInputModeAtom,
  useSetPlayingNotifyAtom,
} from "../../atoms/stateAtoms";
import { InputModeType } from "../../ts/type";
import { useGetTime } from "../useGetTime";

export const useInputModeChange = () => {
  const map = useMapAtom();
  const typeAtomStore = useStore();

  const setPlayingInputMode = useSetPlayingInputModeAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const setLineWord = useSetLineWordAtom();

  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();
  const { readLineStatusRef, writeLineStatusRef } = useLineStatusRef();
  const { readStatusRef, writeStatusRef } = useStatusRef();
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

    const count = readStatusRef().count;
    const nextLine = map!.mapData[count];
    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const nextKpm =
      (newInputMode === "roma" ? map!.mapData[count].kpm["r"] : map!.mapData[count].kpm["k"]) *
      playSpeed;
    if (nextKpm) {
      const userOptions = typeAtomStore.get(userTypingOptionsAtom);

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

    const scene = typeAtomStore.get(sceneAtom);

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
