import { useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { YouTubeEvent } from "react-youtube";
import { useCountRef, useGameUtilsRef, usePlayer, useProgress, useYTStatusRef } from "../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../atoms/speedReducerAtoms";
import {
  useGameStateUtilsRef,
  useSetNotifyState,
  useSetPlayingInputModeState,
  useSetSceneState,
  useSetTabIndexState,
  useSetYTStartedState,
} from "../atoms/stateAtoms";
import { useReadyInputModeStateRef } from "../atoms/storageAtoms";
import { InputMode } from "../ts/type";
import { useTimerControls } from "./playing-hooks/timer-hooks/useTimer";
import { useSendUserStats } from "./playing-hooks/useSendUserStats";

export const useYTPlayEvent = () => {
  const setScene = useSetSceneState();
  const setNotify = useSetNotifyState();
  const setPlayingInputMode = useSetPlayingInputModeState();
  const { sendPlayCountStats } = useSendUserStats();
  const setTabIndex = useSetTabIndexState();
  const { startTimer } = useTimerControls();

  const { readPlayer } = usePlayer();
  const setYTStarted = useSetYTStartedState();
  const { readYTStatus, writeYTStatus } = useYTStatusRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const readReadyInputMode = useReadyInputModeStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();

  return async (event: YouTubeEvent) => {
    console.log("再生 1");
    const { scene, isYTStarted } = readGameStateUtils();

    if (scene === "play" || scene === "practice" || scene === "replay") {
      startTimer();
    }

    const { isPaused } = readYTStatus();
    if (isPaused) {
      writeYTStatus({ isPaused: false });
      setNotify(Symbol("▶"));
    }

    if (isYTStarted) {
      return;
    }

    const movieDuration = readPlayer().getDuration();
    writeYTStatus({ movieDuration });

    const { defaultSpeed } = readPlaySpeed();
    const { isLoadingOverlay } = readGameStateUtils();

    if (isLoadingOverlay) {
      readPlayer().pauseVideo();
      return;
    }

    if (scene !== "replay") {
      if (1 > defaultSpeed) {
        setScene("practice");
      } else if (scene === "ready") {
        setScene("play");
      }

      const readyInputMode = readReadyInputMode();
      setPlayingInputMode(readyInputMode.replace(/""/g, '"') as InputMode);
    }

    sendPlayCountStats();
    setTabIndex(0);
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
  const setScene = useSetSceneState();
  const { readLineProgress, readTotalProgress } = useProgress();
  const { pauseTimer } = useTimerControls();
  const readGameStateUtils = useGameStateUtilsRef();
  return () => {
    console.log("動画停止");

    const lineProgress = readLineProgress();
    const totalProgress = readTotalProgress();

    lineProgress.value = lineProgress.max;
    totalProgress.value = totalProgress.max;

    const { scene } = readGameStateUtils();

    if (scene === "play") {
      setScene("play_end");
    } else if (scene === "practice") {
      setScene("practice_end");
    } else if (scene === "replay_end") {
      setScene("replay_end");
    }

    pauseTimer();
  };
};

export const useYTPauseEvent = () => {
  const setNotify = useSetNotifyState();
  const { readYTStatus, writeYTStatus } = useYTStatusRef();
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("一時停止");

    pauseTimer();

    const isPaused = readYTStatus().isPaused;
    if (!isPaused) {
      writeYTStatus({ isPaused: true });
      setNotify(Symbol("ll"));
    }
  };
};

export const useYTSeekEvent = () => {
  const { readPlayer } = usePlayer();
  const { readGameUtils } = useGameUtilsRef();
  const { writeCount } = useCountRef();

  return () => {
    const time = readPlayer().getCurrentTime();

    const { isRetrySkip } = readGameUtils();

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
