import { useGameUtilsRef, useLineStatusRef } from "../../atoms/refAtoms";
import { useSceneStateRef, useSetNotifyState, useSetSceneState } from "../../atoms/stateAtoms";
import { useVideoSpeedChange } from "../useVideoSpeedChange";
import { useRetry } from "./useRetry";

export const useChangePlayMode = () => {
  const setScene = useSetSceneState();
  const setNotify = useSetNotifyState();
  const retry = useRetry();
  const { defaultSpeedChange } = useVideoSpeedChange();

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
        writeGameUtils({ practiceMyResultId: null, replayKeyCount: 0, replayUserName: "" });
        setScene("playing");
        const { lineResultdrawerClosure: drawerClosure } = readGameUtils();

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
