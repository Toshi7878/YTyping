import { getSession } from "@/lib/auth-client";
import { dispatchImeEvent } from "../../_feature/user-script";
import { addUserResult } from "../../_feature/view-area/end/score-ranking";
import { readImeStats } from "../atoms/ref";
import { getTypeCount, readScene, setScene, setTextareaPlaceholderType } from "../atoms/state";
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
  const typeCount = getTypeCount();
  if (typeCount) {
    addUserResult({ name: getSession()?.user.name ?? "ゲスト", typeCount });
  }
  setScene("end");
  setTextareaPlaceholderType("normal");
  pauseTimer();
  const stats = readImeStats();
  void mutateImeStats(stats);
};
