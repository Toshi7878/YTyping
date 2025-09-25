import { usePlayer } from "../atoms/read-atoms";
import { useReadScene, useSetScene, useSetTextareaPlaceholderType } from "../atoms/state-atoms";
import { useInitializePlayScene } from "./reset";
import { useTimerControls } from "./timer";
import { useUpdateTypingStats } from "./update-typing-stats";

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
    void updateTypingStats();
  };

  return { handleStart, handleEnd };
};

export default useSceneControl;
