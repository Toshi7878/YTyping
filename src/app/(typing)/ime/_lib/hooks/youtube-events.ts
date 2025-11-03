import type { YouTubeEvent } from "react-youtube";
import { readVolume } from "@/lib/atoms/global-atoms";
import { usePlayer } from "../atoms/read-atoms";
import { useReadScene } from "../atoms/state-atoms";
import { useInitializePlayScene } from "./reset";
import { useTimerControls } from "./timer";

export const useOnStart = () => {
  const readScene = useReadScene();
  const initializePlayScene = useInitializePlayScene();

  return async () => {
    const scene = readScene();

    if (scene === "ready") {
      initializePlayScene();
    }
  };
};

export const useOnPlay = () => {
  const { startTimer } = useTimerControls();
  const readScene = useReadScene();
  const onStart = useOnStart();

  return async () => {
    console.log("再生 1");
    const scene = readScene();

    if (scene === "play") {
      startTimer();
    }

    onStart();
  };
};

export const useOnEnd = () => {
  const { readPlayer } = usePlayer();
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("プレイ終了");

    readPlayer().seekTo(0, true);
    readPlayer().stopVideo();
    pauseTimer();
  };
};

export const useOnStop = () => {
  const { pauseTimer } = useTimerControls();
  return () => {
    console.log("動画停止");
    pauseTimer();
  };
};

export const useOnPause = () => {
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("一時停止");

    pauseTimer();
  };
};

export const useOnSeek = () => {
  return () => {
    console.log("シーク");
  };
};

export const useOnReady = () => {
  const { writePlayer } = usePlayer();

  return (event: YouTubeEvent) => {
    const player = event.target as YT.Player;
    player.setVolume(readVolume());
    writePlayer(player);
  };
};
