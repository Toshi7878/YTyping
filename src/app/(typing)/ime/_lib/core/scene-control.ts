import { dispatchImeEvent } from "../../_feature/user-script";
import { readImeStats } from "../atoms/ref";
import { readScene, setScene, setTextareaPlaceholderType } from "../atoms/state";
import { playYTPlayer, stopYTPlayer } from "../atoms/yt-player";
import { mutateImeStats } from "./mutate-stats";
import { initializePlayScene } from "./reset";
import { pauseTimer } from "./timer";

export const startPlayFlow = () => {
  stopYTPlayer();

  if (readScene() !== "ready") {
    initializePlayScene();
  }

  playYTPlayer();
};

export const handleSceneEnd = () => {
  dispatchImeEvent("end");
  setScene("end");
  setTextareaPlaceholderType("normal");
  pauseTimer();
  const stats = readImeStats();
  void mutateImeStats(stats);
};
