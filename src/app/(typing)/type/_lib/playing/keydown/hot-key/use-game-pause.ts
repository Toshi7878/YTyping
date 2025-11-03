import { readYTPlayer } from "../../../atoms/read-atoms";
import { useReadGameUtilityParams } from "../../../atoms/state-atoms";

export const useGamePause = () => {
  const readGameUtilityParams = useReadGameUtilityParams();

  return () => {
    const { isPaused } = readGameUtilityParams();

    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;
    if (isPaused) {
      YTPlayer.playVideo();
    } else {
      YTPlayer.pauseVideo();
    }
  };
};
