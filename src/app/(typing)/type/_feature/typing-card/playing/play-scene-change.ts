import { translate } from "@/i18n/translate";
import { getReadyInputMode } from "@/store/ready-input-mode";
import { resetReplayRankingResult } from "../../atoms/replay";
import { setPlayingInputMode } from "../../atoms/typing-word";
import { setYTPlaybackRate } from "../../atoms/youtube-player";
import { restartPlay } from "../../lib/play-restart";
import { getMediaSpeed, setMinMediaSpeed } from "../../youtube/youtube-player";
import { setNotify } from "../header/notify";
import { getScene, setScene } from "../typing-card";

export const commitPlayModeChange = () => {
  const scene = getScene();
  if (scene === "play") {
    const confirmMessage = translate("typing.scene.confirmPractice");
    if (window.confirm(confirmMessage)) {
      setScene("practice");
    }
  } else {
    const confirmMessage = translate("typing.scene.confirmPlay");
    if (window.confirm(confirmMessage)) {
      resetReplayRankingResult();

      if (scene === "replay") {
        const readyInputMode = getReadyInputMode();
        setPlayingInputMode(readyInputMode);
      }
      const mediaSpeed = getMediaSpeed();

      const newMediaSpeed = mediaSpeed < 1 ? 1 : mediaSpeed;
      setMinMediaSpeed(newMediaSpeed);
      setYTPlaybackRate(newMediaSpeed);

      restartPlay("play");
    }
    setNotify(Symbol(""));
  }
};
