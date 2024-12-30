import { useRefs } from "../../type-contexts/refsProvider";

export const useGamePause = () => {
  const { ytStateRef, playerRef } = useRefs();

  return () => {
    if (ytStateRef.current?.isPaused) {
      playerRef.current!.playVideo();
    } else {
      playerRef.current!.pauseVideo();
    }
  };
};
