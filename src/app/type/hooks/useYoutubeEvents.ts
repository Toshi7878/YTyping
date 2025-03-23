import { useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { YouTubeEvent } from "react-youtube";
import { useGameUtilsRef, usePlayer, useProgress, useStatusRef, useYTStatusRef } from "../atoms/refAtoms";
import {
  useIsLoadingOverlayStateRef,
  useSceneStateRef,
  useSetNotifyState,
  useSetPlayingInputModeState,
  useSetSceneState,
  useSetTabIndexState,
} from "../atoms/stateAtoms";
import { useReadyInputModeStateRef } from "../atoms/storageAtoms";
import { InputMode } from "../ts/type";
import { useTimerControls } from "./playing-hooks/timer-hooks/useTimer";
import { useUpdateUserStats } from "./playing-hooks/useUpdateUserStats";

export const useYTPlayEvent = () => {
  const setScene = useSetSceneState();
  const setNotify = useSetNotifyState();
  const setPlayingInputMode = useSetPlayingInputModeState();
  const { updatePlayCountStats } = useUpdateUserStats();
  const setTabIndex = useSetTabIndexState();
  const { startTimer } = useTimerControls();

  const { readPlayer } = usePlayer();
  const { readGameUtils } = useGameUtilsRef();
  const { readYTStatus, writeYTStatus } = useYTStatusRef();
  const readScene = useSceneStateRef();
  const readIsLoadingOverlay = useIsLoadingOverlayStateRef();
  const readReadyInputMode = useReadyInputModeStateRef();

  return async (event: YouTubeEvent) => {
    console.log("再生 1");
    const scene = readScene();

    if (scene === "playing" || scene === "practice" || scene === "replay") {
      startTimer();
    }

    const isPaused = readYTStatus().isPaused;

    if (isPaused) {
      writeYTStatus({ isPaused: false });
      setNotify(Symbol("▶"));
    }

    if (scene !== "ready") {
      return;
    }

    const movieDuration = readPlayer().getDuration();
    writeYTStatus({ movieDuration });

    const playMode = readGameUtils().playMode;
    const isPlayDataLoad = readIsLoadingOverlay();

    if (isPlayDataLoad) {
      readPlayer().pauseVideo();
      return;
    }

    if (playMode === "replay") {
      setScene("replay");
    } else if (playMode === "practice") {
      setScene("practice");
    } else {
      setScene("playing");
    }

    const readyInputMode = readReadyInputMode();
    setPlayingInputMode(readyInputMode.replace(/""/g, '"') as InputMode);
    updatePlayCountStats();
    setTabIndex(0);
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

  return () => {
    console.log("動画停止");

    const lineProgress = readLineProgress();
    const totalProgress = readTotalProgress();

    lineProgress.value = lineProgress.max;
    totalProgress.value = totalProgress.max;
    setScene("end");

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
  const { writeStatus } = useStatusRef();

  return () => {
    const time = readPlayer().getCurrentTime();

    const { isRetrySkip } = readGameUtils();

    if (isRetrySkip && time === 0) {
      writeStatus({ count: 0 });
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
