import type { YouTubeSpeed } from "@/types/types";
import { useGameUtilityReferenceParams } from "../../atoms/refAtoms";
import { usePlaySpeedReducer, useReadPlaySpeed } from "../../atoms/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useSetLineResultDrawer,
  useSetNotify,
  useSetPlayingInputMode,
  useSetScene,
} from "../../atoms/stateAtoms";
import { useReadReadyInputMode } from "../../atoms/storageAtoms";
import { useRetry } from "./retry";

export const useChangePlayMode = () => {
  const setScene = useSetScene();
  const setNotify = useSetNotify();
  const retry = useRetry();
  const dispatchSpeed = usePlaySpeedReducer();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readGameUtilParams = useReadGameUtilParams();
  const setPlayingInputMode = useSetPlayingInputMode();
  const setLineResultDrawer = useSetLineResultDrawer();

  const readSpeed = useReadPlaySpeed();
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
        writeGameUtilRefParams({ replayKeyCount: 0, replayUserName: "" });

        setLineResultDrawer(false);

        if (scene === "replay") {
          setPlayingInputMode(readReadyInputMode());
        }
        const { playSpeed } = readSpeed();
        dispatchSpeed({ type: "set", payload: 1 > playSpeed ? 1 : (playSpeed as YouTubeSpeed) });

        retry("play");
      }
      setNotify(Symbol(""));
    }
  };
};
