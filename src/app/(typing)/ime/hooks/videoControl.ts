import { usePlayer } from "../atom/refAtoms";
import { useSetScene } from "../atom/stateAtoms";
import { useRetry } from "./reset";

const useVideoControl = () => {
  const { readPlayer } = usePlayer();
  const setScene = useSetScene();
  const retry = useRetry();

  const handleStart = () => {
    retry();
    readPlayer().playVideo();
  };

  const handleEnd = () => {
    readPlayer().stopVideo();
    setScene("end");
  };

  return { handleStart, handleEnd };
};

export default useVideoControl;
