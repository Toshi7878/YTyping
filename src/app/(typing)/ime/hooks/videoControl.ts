import { RESET } from "jotai/utils";
import { usePlayer } from "../atom/refAtoms";
import { useSetDisplayLines, useSetScene } from "../atom/stateAtoms";
import { useRetry } from "./reset";

const useVideoControl = () => {
  const { readPlayer } = usePlayer();
  const setScene = useSetScene();
  const setDisplayLines = useSetDisplayLines();
  const retry = useRetry();

  const handleStart = () => {
    readPlayer().stopVideo();
    retry();
    readPlayer().playVideo();
  };

  const handleEnd = () => {
    setDisplayLines(RESET);
    readPlayer().stopVideo();
    setScene("end");
  };

  return { handleStart, handleEnd };
};

export default useVideoControl;
