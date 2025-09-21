import { useReadVolume } from "@/lib/globalAtoms";
import type { YTPlayer } from "@/types/global-types";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  usePlayer,
  useProgress,
  useReadYTStatus,
} from "../atoms/refAtoms";
import { useReadPlaySpeed } from "../atoms/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useReadMap,
  useSetNotify,
  useSetPlayingInputMode,
  useSetScene,
  useSetTabName,
  useSetYTStarted,
} from "../atoms/stateAtoms";
import { useReadReadyInputMode } from "../atoms/storageAtoms";
import type { InputMode } from "../type";
import { useSendUserStats } from "./playing/sendUserStats";
import { useTimerControls } from "./playing/timer/timer";
import { useUpdateAllStatus } from "./playing/updateStatus";

export const useYTPlayEvent = () => {
  const setScene = useSetScene();
  const setNotify = useSetNotify();
  const setPlayingInputMode = useSetPlayingInputMode();
  const { sendPlayCountStats } = useSendUserStats();
  const setTabName = useSetTabName();
  const { startTimer } = useTimerControls();

  const { readPlayer } = usePlayer();
  const setYTStarted = useSetYTStarted();
  const { readYTStatus, writeYTStatus } = useReadYTStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readReadyInputMode = useReadReadyInputMode();
  const readPlaySpeed = useReadPlaySpeed();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useReadMap();

  return async () => {
    console.log("再生 1");
    const { scene, isYTStarted } = readGameStateUtils();

    if (scene === "play" || scene === "practice" || scene === "replay") {
      startTimer();
    }

    const { isPaused } = readYTStatus();
    if (isPaused) {
      writeYTStatus({ isPaused: false });

      if (scene !== "practice") {
        setNotify(Symbol("▶"));
      }
    }

    if (isYTStarted) {
      return;
    }

    const movieDuration = readPlayer().getDuration();
    writeYTStatus({ movieDuration });

    const { playSpeed, minPlaySpeed } = readPlaySpeed();
    const { isLoadingOverlay } = readGameStateUtils();

    readPlayer().setPlaybackRate(playSpeed);
    if (isLoadingOverlay) {
      readPlayer().pauseVideo();
      return;
    }

    if (scene !== "replay") {
      if (1 > minPlaySpeed) {
        setScene("practice");
      } else if (scene === "ready") {
        setScene("play");
      }

      const readyInputMode = readReadyInputMode();
      setPlayingInputMode(readyInputMode.replace(/""/g, '"') as InputMode);
      const map = readMap();
      if (map && scene === "practice") {
        updateAllStatus({ count: map.mapData.length - 1, updateType: "lineUpdate" });
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
  // const { pauseTimer } = useTimerControls();
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

    // pauseTimer();
  };
};

export const useYTPauseEvent = () => {
  const setNotify = useSetNotify();
  const { readYTStatus, writeYTStatus } = useReadYTStatus();
  const { pauseTimer } = useTimerControls();
  const readGameUtilParams = useReadGameUtilParams();

  return () => {
    console.log("一時停止");

    pauseTimer();

    const { isPaused } = readYTStatus();
    if (!isPaused) {
      writeYTStatus({ isPaused: true });
      const { scene } = readGameUtilParams();
      if (scene === "practice") return;
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
  const readVolume = useReadVolume();
  const { writePlayer } = usePlayer();

  return (event: { target: YTPlayer }) => {
    const player = event.target;
    player.setVolume(readVolume());
    writePlayer(player);
  };
};
