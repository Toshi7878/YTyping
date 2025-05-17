import { RESET } from "jotai/utils";
import { usePlayer } from "../atom/refAtoms";
import { useSetDisplayLines, useSetScene } from "../atom/stateAtoms";
import { useInitializePlayScene } from "./reset";

const useSceneControl = () => {
  const { readPlayer } = usePlayer();
  const setScene = useSetScene();
  const setDisplayLines = useSetDisplayLines();
  const initializePlayScene = useInitializePlayScene();

  const handleStart = () => {
    readPlayer().stopVideo();
    initializePlayScene();
    readPlayer().playVideo();
  };

  const handleEnd = () => {
    setDisplayLines(RESET);
    setScene("end");
  };

  return { handleStart, handleEnd };
};

export default useSceneControl;
