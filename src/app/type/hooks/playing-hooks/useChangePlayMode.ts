import { YouTubeSpeed } from "@/types";
import { useGameUtilsRef, useLineStatusRef } from "../../atoms/refAtoms";
import { usePlaySpeedReducer } from "../../atoms/speedReducerAtoms";
import { useGameStateUtilsRef, useSetNotifyState, useSetSceneState } from "../../atoms/stateAtoms";
import { useRetry } from "./retry";

export const useChangePlayMode = () => {
  const setScene = useSetSceneState();
  const setNotify = useSetNotifyState();
  const retry = useRetry();
  const dispatchSpeed = usePlaySpeedReducer();

  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const { readLineStatus } = useLineStatusRef();
  const readGameStateUtils = useGameStateUtilsRef();

  return () => {
    const { scene } = readGameStateUtils();
    if (scene === "play") {
      const confirmMessage = "練習モードに移動しますか？";
      if (window.confirm(confirmMessage)) {
        setScene("practice");
      }
    } else {
      const confirmMessage = "本番モードに移動しますか？了承すると初めから再生されます。";
      if (window.confirm(confirmMessage)) {
        const { startSpeed } = readLineStatus();
        writeGameUtils({ practiceMyResultId: null, replayKeyCount: 0, replayUserName: "" });
        const { lineResultdrawerClosure: drawerClosure } = readGameUtils();

        if (drawerClosure) {
          drawerClosure.onClose();
        }
        retry("play");
        dispatchSpeed({ type: "set", payload: 1 > startSpeed ? 1 : (startSpeed as YouTubeSpeed) });
      }
      setNotify(Symbol(""));
    }
  };
};
