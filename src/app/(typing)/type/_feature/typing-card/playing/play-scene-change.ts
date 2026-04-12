import { readReadyInputMode } from "@/lib/atoms/global-atoms";
import { writeUtilityRefParams } from "../../../_atoms/ref";
import {
  readMediaSpeed,
  readUtilityParams,
  resetReplayRankingResult,
  setMinMediaSpeed,
  setNotify,
  setPlayingInputMode,
  setScene,
} from "../../../_atoms/state";
import { setYTPlaybackRate } from "../../../_atoms/youtube-player";
import { restartPlay } from "../../../_lib/play-restart";

export const commitPlayModeChange = () => {
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
      resetReplayRankingResult();

      if (scene === "replay") {
        const readyInputMode = readReadyInputMode();
        setPlayingInputMode(readyInputMode);
      }
      const mediaSpeed = readMediaSpeed();

      const newMediaSpeed = mediaSpeed < 1 ? 1 : mediaSpeed;
      setMinMediaSpeed(newMediaSpeed);
      setYTPlaybackRate(newMediaSpeed);

      restartPlay("play");
    }
    setNotify(Symbol(""));
  }
};
