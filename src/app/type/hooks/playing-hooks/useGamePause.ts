import { useStore } from "jotai";
import { usePlayer, useYTStatusRef } from "../../atoms/refAtoms";

export const useGamePause = () => {
  const typeAtomStore = useStore();

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
