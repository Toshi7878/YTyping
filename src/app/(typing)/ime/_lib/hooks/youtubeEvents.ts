import { useReadVolume } from "@/lib/globalAtoms";
import { usePlayer } from "../atoms/refAtoms";
import { useReadScene } from "../atoms/stateAtoms";
import { useInitializePlayScene } from "./reset";
import { useTimerControls } from "./timer";

export const useYTPlayEvent = () => {
  const { startTimer } = useTimerControls();
  const initializePlayScene = useInitializePlayScene();
  const readScene = useReadScene();

  return async () => {
    console.log("再生 1");
    const scene = readScene();

    if (scene === "play") {
      startTimer();
    }

    if (scene === "ready") {
      initializePlayScene();
    }
  };
};

export const useYTEndEvent = () => {
  const { readPlayer } = usePlayer();
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("プレイ終了");

    readPlayer().seekTo(0, true);
    readPlayer().stopVideo();
    pauseTimer();
  };
};

export const useYTStopEvent = () => {
  const { pauseTimer } = useTimerControls();
  return () => {
    console.log("動画停止");
    pauseTimer();
  };
};

export const useYTPauseEvent = () => {
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("一時停止");

    pauseTimer();
  };
};

export const useYTSeekEvent = () => {
  return () => {
    console.log("シーク");
  };
};

export const useYTReadyEvent = () => {
  const { writePlayer } = usePlayer();

  const readVolume = useReadVolume();
  return (event) => {
    const player = event.target as YT.Player;
    player.setVolume(readVolume());
    writePlayer(player);
  };
};
