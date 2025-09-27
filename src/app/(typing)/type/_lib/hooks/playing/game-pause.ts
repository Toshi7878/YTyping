import { usePlayer, useReadYTStatus } from "../../atoms/ref-atoms";

export const useGamePause = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useReadYTStatus();
  return () => {
    const { isPaused } = readYTStatus();
    if (isPaused) {
      readPlayer().playVideo();
    } else {
      readPlayer().pauseVideo();
    }
  };
};
