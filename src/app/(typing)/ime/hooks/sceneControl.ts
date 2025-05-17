import { usePlayer } from "../atom/refAtoms";
import { useResetGameUtilParams, useSetScene } from "../atom/stateAtoms";
import { useInitializePlayScene } from "./reset";
import { useTimerControls } from "./timer";

const useSceneControl = () => {
  const { readPlayer } = usePlayer();
  const setScene = useSetScene();
  const initializePlayScene = useInitializePlayScene();
  const { pauseTimer } = useTimerControls();

  const resetGameUtils = useResetGameUtilParams();

  const handleStart = () => {
    readPlayer().stopVideo();
    initializePlayScene();
    readPlayer().playVideo();
  };

  const handleEnd = () => {
    resetGameUtils();
    setScene("end");
    pauseTimer();
  };

  return { handleStart, handleEnd };
};

export default useSceneControl;
