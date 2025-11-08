import { readUtilityParams } from "../atoms/state";
import { pauseYTPlayer, playYTPlayer } from "../atoms/yt-player";

export const togglePause = () => {
  const { isPaused } = readUtilityParams();
  if (isPaused) {
    playYTPlayer();
  } else {
    pauseYTPlayer();
  }
};
