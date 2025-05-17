import { useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { useGameUtilityReferenceParams, useLineCount, usePlayer, useYTStatus } from "../atom/refAtoms";
import { useReadGameUtilParams, useSetScene, useSetYTStarted } from "../atom/stateAtoms";
import { useTimerControls } from "./timer";

export const useYTPlayEvent = () => {
  const setScene = useSetScene();
  const { startTimer } = useTimerControls();

  const { readPlayer } = usePlayer();
  const setYTStarted = useSetYTStarted();
  const { readYTStatus, writeYTStatus } = useYTStatus();
  const readGameStateUtils = useReadGameUtilParams();

  return async () => {
    console.log("再生 1");
    const { scene, isYTStarted } = readGameStateUtils();

    if (scene === "play") {
      startTimer();
    }

    const { isPaused } = readYTStatus();
    if (isPaused) {
      writeYTStatus({ isPaused: false });
    }

    if (isYTStarted) {
      return;
    }

    const movieDuration = readPlayer().getDuration();
    writeYTStatus({ movieDuration });

    const { isLoadingOverlay } = readGameStateUtils();

    if (isLoadingOverlay) {
      readPlayer().pauseVideo();
      return;
    }

    if (scene === "ready") {
      setScene("play");
    }

    setYTStarted(true);
  };
};

export const useYTEndEvent = () => {
  const { readPlayer } = usePlayer();

  return () => {
    console.log("プレイ終了");

    readPlayer().seekTo(0, true);
    readPlayer().stopVideo();
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
  const { readYTStatus, writeYTStatus } = useYTStatus();
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("一時停止");

    pauseTimer();

    const isPaused = readYTStatus().isPaused;
    if (!isPaused) {
      writeYTStatus({ isPaused: true });
    }
  };
};

export const useYTSeekEvent = () => {
  const { readPlayer } = usePlayer();
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const { writeCount } = useLineCount();

  return () => {
    const time = readPlayer().getCurrentTime();

    const { isRetrySkip } = readGameUtilRefParams();

    if (isRetrySkip && time === 0) {
      writeCount(0);
    }

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
