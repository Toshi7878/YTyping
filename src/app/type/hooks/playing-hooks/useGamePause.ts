import { usePlayer, useYTStatusRef } from "../../atoms/refAtoms";

export const useGamePause = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatusRef } = useYTStatusRef();
  return () => {
    const isPaused = readYTStatusRef().isPaused;
    if (isPaused) {
      readPlayer().playVideo();
    } else {
      readPlayer().pauseVideo();
    }
  };
};
