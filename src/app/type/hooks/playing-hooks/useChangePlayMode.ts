import { useStore } from "jotai";
import { gameStateRefAtom, lineTypingStatusRefAtom } from "../../atoms/refAtoms";
import {
  drawerClosureAtom,
  sceneAtom,
  useSetPlayingNotifyAtom,
  useSetSceneAtom,
} from "../../atoms/stateAtoms";
import { DEFAULT_GAME_STATE_REF } from "../../ts/const/typeDefaultValue";
import { useVideoSpeedChange } from "../useVideoSpeedChange";
import { useRetry } from "./useRetry";

export const useChangePlayMode = () => {
  const setScene = useSetSceneAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const retry = useRetry();
  const { defaultSpeedChange } = useVideoSpeedChange();
  const typeAtomStore = useStore();

  return () => {
    const scene = typeAtomStore.get(sceneAtom);
    if (scene === "playing") {
      const confirmMessage = "練習モードに移動しますか？";
      if (window.confirm(confirmMessage)) {
        typeAtomStore.set(gameStateRefAtom, (prev) => ({ ...prev, playMode: "practice" }));
        setScene("practice");
      }
    } else {
      const confirmMessage = "本番モードに移動しますか？了承すると初めから再生されます。";
      if (window.confirm(confirmMessage)) {
        typeAtomStore.set(gameStateRefAtom, (prev) => ({
          ...prev,
          practice: structuredClone(DEFAULT_GAME_STATE_REF.practice),
          replay: structuredClone(DEFAULT_GAME_STATE_REF.replay),
        }));
        setScene("playing");
        const drawerClosure = typeAtomStore.get(drawerClosureAtom);

        if (drawerClosure) {
          drawerClosure.onClose();
        }
        retry("playing");
        defaultSpeedChange("set", typeAtomStore.get(lineTypingStatusRefAtom).startSpeed);
      }
      setNotify(Symbol(""));
    }
  };
};
