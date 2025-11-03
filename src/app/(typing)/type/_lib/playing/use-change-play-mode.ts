import type { YouTubeSpeed } from "@/utils/types";
import { writeUtilityRefParams } from "../atoms/read-atoms";
import { usePlaySpeedReducer, useReadPlaySpeed } from "../atoms/speed-reducer-atoms";
import {
  useReadGameUtilityParams,
  useSetLineResultDrawer,
  useSetNotify,
  useSetPlayingInputMode,
  useSetScene,
} from "../atoms/state-atoms";
import { useReadReadyInputMode } from "../atoms/storage-atoms";
import { useRetry } from "./use-retry";

export const useChangePlayMode = () => {
  const setScene = useSetScene();
  const setNotify = useSetNotify();
  const retry = useRetry();
  const dispatchSpeed = usePlaySpeedReducer();

  const readGameUtilityParams = useReadGameUtilityParams();
  const setPlayingInputMode = useSetPlayingInputMode();
  const setLineResultDrawer = useSetLineResultDrawer();

  const readSpeed = useReadPlaySpeed();
  const readReadyInputMode = useReadReadyInputMode();

  return () => {
    const { scene } = readGameUtilityParams();
    if (scene === "play") {
      const confirmMessage = "練習モードに移動しますか？";
      if (window.confirm(confirmMessage)) {
        setScene("practice");
      }
    } else {
      const confirmMessage = "本番モードに移動しますか？了承すると初めから再生されます。";
      if (window.confirm(confirmMessage)) {
        writeUtilityRefParams({ replayKeyCount: 0, replayUserName: "" });

        setLineResultDrawer(false);

        if (scene === "replay") {
          setPlayingInputMode(readReadyInputMode());
        }
        const { playSpeed } = readSpeed();
        dispatchSpeed({ type: "set", payload: playSpeed < 1 ? 1 : (playSpeed as YouTubeSpeed) });

        retry("play");
      }
      setNotify(Symbol(""));
    }
  };
};
