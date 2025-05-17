import { useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { usePlayer } from "../atom/refAtoms";
import { useReadScene } from "../atom/stateAtoms";
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
  const { readPlayer } = usePlayer();
  const { pauseTimer } = useTimerControls();
  return () => {
    console.log("動画停止");
    readPlayer().stopVideo();
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
  const { readPlayer } = usePlayer();

  return () => {
    const time = readPlayer().getCurrentTime();

    console.log("シーク");
  };
};

export const useYTReadyEvent = () => {
  const volumeAtom = useVolumeState();
  const { writePlayer } = usePlayer();

  return (event) => {
    const player = event.target as YTPlayer;
    player.setVolume(volumeAtom);
    writePlayer(player);
  };
};
