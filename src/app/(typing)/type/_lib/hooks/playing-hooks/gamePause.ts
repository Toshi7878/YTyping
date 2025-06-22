import { usePlayer, useYTStatus } from "../../atoms/refAtoms";

export const useGamePause = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useYTStatus();
  return () => {
    const isPaused = readYTStatus().isPaused;
    if (isPaused) {
      readPlayer().playVideo();
    } else {
      readPlayer().pauseVideo();
    }
  };
};
