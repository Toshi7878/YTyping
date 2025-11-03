import type { YouTubeSpeed } from "@/utils/types";
import { writeUtilityRefParams } from "../atoms/ref";
import { handlePlaySpeedAction, readPlaySpeed } from "../atoms/speed-reducer";
import {
  readUtilityParams,
  setLineResultSheet,
  setNotify,
  setPlayingInputMode,
  setReplayUserName,
  setScene,
} from "../atoms/state";
import { readReadyInputMode } from "../atoms/storage";
import { useRetry } from "./use-retry";

export const useChangePlayMode = () => {
  const retry = useRetry();

  return () => {
    const { scene } = readUtilityParams();
    if (scene === "play") {
      const confirmMessage = "練習モードに移動しますか？";
      if (window.confirm(confirmMessage)) {
        setScene("practice");
      }
    } else {
      const confirmMessage = "本番モードに移動しますか？了承すると初めから再生されます。";
      if (window.confirm(confirmMessage)) {
        writeUtilityRefParams({ replayKeyCount: 0 });
        setReplayUserName(null);

        setLineResultSheet(false);

        if (scene === "replay") {
          const readyInputMode = readReadyInputMode();
          setPlayingInputMode(readyInputMode);
        }
        const { playSpeed } = readPlaySpeed();
        handlePlaySpeedAction({ type: "set", payload: playSpeed < 1 ? 1 : (playSpeed as YouTubeSpeed) });

        retry("play");
      }
      setNotify(Symbol(""));
    }
  };
};
