import { useStore } from "jotai";
import { usePlayer, ytStateRefAtom } from "../../atoms/refAtoms";

export const useGamePause = () => {
  const player = usePlayer();
  const typeAtomStore = useStore();

  return () => {
    const isPaused = typeAtomStore.get(ytStateRefAtom).isPaused;
    if (isPaused) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  };
};
