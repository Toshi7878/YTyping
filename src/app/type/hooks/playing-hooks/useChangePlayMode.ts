import { YouTubeSpeed } from "@/types";
import { usePlaySpeedReducer } from "../../atoms/reducerAtoms";
import { useGameUtilsRef, useLineStatusRef } from "../../atoms/refAtoms";
import { useSceneStateRef, useSetNotifyState, useSetSceneState } from "../../atoms/stateAtoms";
import { useRetry } from "./useRetry";

export const useChangePlayMode = () => {
  const setScene = useSetSceneState();
  const setNotify = useSetNotifyState();
  const retry = useRetry();
  const dispatchSpeed = usePlaySpeedReducer();

  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const { readLineStatusRef } = useLineStatusRef();
  const readScene = useSceneStateRef();

  return () => {
    const scene = readScene();
    if (scene === "playing") {
      const confirmMessage = "練習モードに移動しますか？";
      if (window.confirm(confirmMessage)) {
        writeGameUtils({ playMode: "practice" });
        setScene("practice");
      }
    } else {
      const confirmMessage = "本番モードに移動しますか？了承すると初めから再生されます。";
      if (window.confirm(confirmMessage)) {
        const { startSpeed } = readLineStatusRef();
        writeGameUtils({ practiceMyResultId: null, replayKeyCount: 0, replayUserName: "" });
        setScene("playing");
        const { lineResultdrawerClosure: drawerClosure } = readGameUtils();

        if (drawerClosure) {
          drawerClosure.onClose();
        }
        retry("playing");
        dispatchSpeed({ type: "set", payload: startSpeed as YouTubeSpeed });
      }
      setNotify(Symbol(""));
    }
  };
};
