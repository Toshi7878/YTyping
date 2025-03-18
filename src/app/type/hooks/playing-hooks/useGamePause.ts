import { usePlayer, useYTStatusRef } from "../../atoms/refAtoms";

export const useGamePause = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useYTStatusRef();
  return () => {
    const isPaused = readYTStatus().isPaused;
    if (isPaused) {
      readPlayer().playVideo();
    } else {
      readPlayer().pauseVideo();
    }
  };
};
