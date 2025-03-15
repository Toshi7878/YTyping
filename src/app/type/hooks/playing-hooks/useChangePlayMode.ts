import { useStore } from "jotai";
import { useGameRef, useLineStatusRef } from "../../atoms/refAtoms";
import {
  drawerClosureAtom,
  sceneAtom,
  useSetPlayingNotifyAtom,
  useSetSceneAtom,
} from "../../atoms/stateAtoms";
import { useVideoSpeedChange } from "../useVideoSpeedChange";
import { useRetry } from "./useRetry";

export const useChangePlayMode = () => {
  const setScene = useSetSceneAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const retry = useRetry();
  const { defaultSpeedChange } = useVideoSpeedChange();
  const typeAtomStore = useStore();

  const { writeGameRef } = useGameRef();
  const { readLineStatusRef } = useLineStatusRef();

  return () => {
    const scene = typeAtomStore.get(sceneAtom);
    if (scene === "playing") {
      const confirmMessage = "練習モードに移動しますか？";
      if (window.confirm(confirmMessage)) {
        writeGameRef({ playMode: "practice" });
        setScene("practice");
      }
    } else {
      const confirmMessage = "本番モードに移動しますか？了承すると初めから再生されます。";
      if (window.confirm(confirmMessage)) {
        writeGameRef({ practiceMyResultId: null, replayKeyCount: 0, replayUserName: "" });
        setScene("playing");
        const drawerClosure = typeAtomStore.get(drawerClosureAtom);

        if (drawerClosure) {
          drawerClosure.onClose();
        }
        retry("playing");
        defaultSpeedChange("set", readLineStatusRef().startSpeed);
      }
      setNotify(Symbol(""));
    }
  };
};
