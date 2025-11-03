import { readYTPlayer } from "../../../atoms/read-atoms";
import { readUtilityParams } from "../../../atoms/state-atoms";

export const useGamePause = () => {
  return () => {
    const { isPaused } = readUtilityParams();

    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;
    if (isPaused) {
      YTPlayer.playVideo();
    } else {
      YTPlayer.pauseVideo();
    }
  };
};
