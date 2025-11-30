import { readUtilityParams } from "../atoms/state";
import { pauseYTPlayer, playYTPlayer } from "../atoms/youtube-player";

export const togglePause = () => {
  const { isPaused } = readUtilityParams();
  if (isPaused) {
    playYTPlayer();
  } else {
    pauseYTPlayer();
  }
};
