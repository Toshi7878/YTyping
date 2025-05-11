import { YouTubeSpeed } from "@/types";
import { usegameUtilityReferenceParams, useLineStatus } from "../../atoms/refAtoms";
import { usePlaySpeedReducer } from "../../atoms/speedReducerAtoms";
import { useReadGameUtilParams, useSetNotify, useSetScene } from "../../atoms/stateAtoms";
import { useRetry } from "./retry";

export const useChangePlayMode = () => {
  const setScene = useSetScene();
  const setNotify = useSetNotify();
  const retry = useRetry();
  const dispatchSpeed = usePlaySpeedReducer();

  const { writeGameUtilRefParams, readGameUtilRefParams } = usegameUtilityReferenceParams();
  const { readLineStatus } = useLineStatus();
  const readGameStateUtils = useReadGameUtilParams();

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
        writeGameUtilRefParams({ practiceMyResultId: null, replayKeyCount: 0, replayUserName: "" });
        const { lineResultdrawerClosure: drawerClosure } = readGameUtilRefParams();

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
