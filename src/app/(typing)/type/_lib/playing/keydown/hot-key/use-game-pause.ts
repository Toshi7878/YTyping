import { usePlayer } from "../../../atoms/read-atoms";
import { useReadGameUtilityParams } from "../../../atoms/state-atoms";

export const useGamePause = () => {
  const { readPlayer } = usePlayer();
  const readGameUtilityParams = useReadGameUtilityParams();

  return () => {
    const { isPaused } = readGameUtilityParams();
    if (isPaused) {
      readPlayer().playVideo();
    } else {
      readPlayer().pauseVideo();
    }
  };
};
