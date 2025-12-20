import { writeUtilityRefParams } from "../atoms/ref";
import {
  readMediaSpeed,
  readUtilityParams,
  resetReplayRankingResult,
  setLineResultSheet,
  setNotify,
  setPlayingInputMode,
  setScene,
} from "../atoms/state";
import { readReadyInputMode } from "../atoms/storage";
import { setYTPlaybackRate } from "../atoms/youtube-player";
import { commitPlayRestart } from "./commit-play-restart";

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

      setLineResultSheet(false);

      if (scene === "replay") {
        const readyInputMode = readReadyInputMode();
        setPlayingInputMode(readyInputMode);
      }
      const playSpeed = readMediaSpeed();

      setYTPlaybackRate(playSpeed < 1 ? 1 : playSpeed);

      commitPlayRestart("play");
    }
    setNotify(Symbol(""));
  }
};
