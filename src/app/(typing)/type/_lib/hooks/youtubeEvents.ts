import { useVolumeState } from "@/lib/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { useGameUtilityReferenceParams, useLineCount, usePlayer, useProgress, useYTStatus } from "../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../atoms/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useReadMapState,
  useSetNotify,
  useSetPlayingInputMode,
  useSetScene,
  useSetTabName,
  useSetYTStarted,
} from "../atoms/stateAtoms";
import { useReadReadyInputMode } from "../atoms/storageAtoms";
import { InputMode } from "../type";
import { useSendUserStats } from "./playing-hooks/sendUserStats";
import { useTimerControls } from "./playing-hooks/timer-hooks/timer";
import { useUpdateAllStatus } from "./playing-hooks/updateStatus";

export const useYTPlayEvent = () => {
  const setScene = useSetScene();
  const setNotify = useSetNotify();
  const setPlayingInputMode = useSetPlayingInputMode();
  const { sendPlayCountStats } = useSendUserStats();
  const setTabName = useSetTabName();
  const { startTimer } = useTimerControls();

  const { readPlayer } = usePlayer();
  const setYTStarted = useSetYTStarted();
  const { readYTStatus, writeYTStatus } = useYTStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readReadyInputMode = useReadReadyInputMode();
  const readPlaySpeed = usePlaySpeedStateRef();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useReadMapState();

  return async () => {
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
      if (scene === "practice") {
        updateAllStatus({
          count: readMap().mapData.length - 1,
          updateType: "lineUpdate",
        });
      }
    }

    sendPlayCountStats();
    setTabName("ステータス");
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
  const setScene = useSetScene();
  const { readLineProgress, readTotalProgress } = useProgress();
  const { pauseTimer } = useTimerControls();
  const readGameStateUtils = useReadGameUtilParams();
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
    } else if (scene === "replay") {
      setScene("replay_end");
    }

    pauseTimer();
  };
};

export const useYTPauseEvent = () => {
  const setNotify = useSetNotify();
  const { readYTStatus, writeYTStatus } = useYTStatus();
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

  return (event: { target: YTPlayer }) => {
    const player = event.target;
    player.setVolume(volumeAtom);
    writePlayer(player);
  };
};
