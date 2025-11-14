import { readVolume } from "@/lib/atoms/global-atoms";
import { readScene } from "../atoms/state";
import { seekYTPlayer, setYTPlayer, stopYTPlayer } from "../atoms/yt-player";
import { initializePlayScene } from "./reset";
import { pauseTimer, startTimer } from "./timer";

const onStart = async () => {
  const scene = readScene();

  if (scene === "ready") {
    initializePlayScene();
  }
};

export const onPlay = async () => {
  console.log("再生 1");
  const scene = readScene();
  onStart();

  if (scene === "play") {
    startTimer();
  }
};

export const onEnd = () => {
  console.log("プレイ終了");

  seekYTPlayer(0);
  stopYTPlayer();
  pauseTimer();
};

export const onPause = () => {
  console.log("一時停止");
  pauseTimer();
};

export const onReady = (event: { target: YT.Player }) => {
  const player = event.target as YT.Player;
  player.setVolume(readVolume());
  setYTPlayer(player);
};
