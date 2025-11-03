import { readYTPlayer } from "../../../atoms/ref";
import { readUtilityParams } from "../../../atoms/state";

export const togglePause = () => {
  const { isPaused } = readUtilityParams();

  const YTPlayer = readYTPlayer();
  if (!YTPlayer) return;
  if (isPaused) {
    YTPlayer.playVideo();
  } else {
    YTPlayer.pauseVideo();
  }
};
