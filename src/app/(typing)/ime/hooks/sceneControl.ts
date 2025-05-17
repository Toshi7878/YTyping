import { usePlayer } from "../atom/refAtoms";
import { useSetScene } from "../atom/stateAtoms";
import { useInitializePlayScene } from "./reset";
import { useTimerControls } from "./timer";

const useSceneControl = () => {
  const { readPlayer } = usePlayer();
  const setScene = useSetScene();
  const initializePlayScene = useInitializePlayScene();
  const { pauseTimer } = useTimerControls();

  const handleStart = () => {
    readPlayer().stopVideo();
    initializePlayScene();
    readPlayer().playVideo();
  };

  const handleEnd = () => {
    setScene("end");
    pauseTimer();
  };

  return { handleStart, handleEnd };
};

export default useSceneControl;
