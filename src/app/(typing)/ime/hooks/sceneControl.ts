import { usePlayer } from "../atom/refAtoms";
import { useReadScene, useSetScene, useSetTextareaPlaceholderType } from "../atom/stateAtoms";
import { useInitializePlayScene } from "./reset";
import { useTimerControls } from "./timer";
import { useUpdateTypingStats } from "./updateTypingStats";

const useSceneControl = () => {
  const { readPlayer } = usePlayer();
  const setScene = useSetScene();
  const initializePlayScene = useInitializePlayScene();
  const { pauseTimer } = useTimerControls();
  const setTextareaPlaceholderType = useSetTextareaPlaceholderType();
  const updateTypingStats = useUpdateTypingStats();
  const readScene = useReadScene();

  const handleStart = () => {
    readPlayer().stopVideo();
    if (readScene() !== "ready") {
      initializePlayScene();
    }
    readPlayer().playVideo();
  };

  const handleEnd = () => {
    setScene("end");
    setTextareaPlaceholderType("normal");
    pauseTimer();
    updateTypingStats();
  };

  return { handleStart, handleEnd };
};

export default useSceneControl;
