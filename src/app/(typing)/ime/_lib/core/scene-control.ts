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
  setScene("end");
  setTextareaPlaceholderType("normal");
  pauseTimer();
  void mutateImeStats();
};
