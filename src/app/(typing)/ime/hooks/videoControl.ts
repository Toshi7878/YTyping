import { usePlayer } from "../atom/refAtoms";
import { useResetGameUtilParams, useSetScene } from "../atom/stateAtoms";
import { useInitializePlayScene } from "./reset";

const useSceneControl = () => {
  const { readPlayer } = usePlayer();
  const setScene = useSetScene();
  const initializePlayScene = useInitializePlayScene();
  const resetGameUtils = useResetGameUtilParams();

  const handleStart = () => {
    readPlayer().stopVideo();
    initializePlayScene();
    readPlayer().playVideo();
  };

  const handleEnd = () => {
    resetGameUtils();
    setScene("end");
  };

  return { handleStart, handleEnd };
};

export default useSceneControl;
