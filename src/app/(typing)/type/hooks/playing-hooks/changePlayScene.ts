import { YouTubeSpeed } from "@/types";
import { useGameUtilityReferenceParams, useLineStatus } from "../../atoms/refAtoms";
import { usePlaySpeedReducer } from "../../atoms/speedReducerAtoms";
import { useReadGameUtilParams, useSetNotify, useSetPlayingInputMode, useSetScene } from "../../atoms/stateAtoms";
import { useReadReadyInputMode } from "../../atoms/storageAtoms";
import { useRetry } from "./retry";

export const useChangePlayMode = () => {
  const setScene = useSetScene();
  const setNotify = useSetNotify();
  const retry = useRetry();
  const dispatchSpeed = usePlaySpeedReducer();

  const { writeGameUtilRefParams, readGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readLineStatus } = useLineStatus();
  const readGameUtilParams = useReadGameUtilParams();
  const setPlayingInputMode = useSetPlayingInputMode();

  const readReadyInputMode = useReadReadyInputMode();

  return () => {
    const { scene } = readGameUtilParams();
    if (scene === "play") {
      const confirmMessage = "練習モードに移動しますか？";
      if (window.confirm(confirmMessage)) {
        setScene("practice");
      }
    } else {
      const confirmMessage = "本番モードに移動しますか？了承すると初めから再生されます。";
      if (window.confirm(confirmMessage)) {
        const { startSpeed } = readLineStatus();

        writeGameUtilRefParams({ practiceMyResultId: null, replayKeyCount: 0, replayUserName: "" });
        const { lineResultdrawerClosure: drawerClosure } = readGameUtilRefParams();

        if (drawerClosure) {
          drawerClosure.onClose();
        }

        if (scene === "replay") {
          setPlayingInputMode(readReadyInputMode());
        }
        retry("play");
        dispatchSpeed({ type: "set", payload: 1 > startSpeed ? 1 : (startSpeed as YouTubeSpeed) });
      }
      setNotify(Symbol(""));
    }
  };
};
