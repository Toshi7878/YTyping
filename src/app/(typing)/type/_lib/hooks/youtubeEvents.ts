import { useReadVolume } from "@/lib/globalAtoms";
import { windowFocus } from "@/utils/hooks/windowFocus";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  usePlayer,
  useProgress,
  useReadYTStatus,
} from "../atoms/refAtoms";
import { useReadPlaySpeed, useSetSpeed } from "../atoms/speedReducerAtoms";
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

export const useOnStart = () => {
  const setScene = useSetScene();
  const setPlayingInputMode = useSetPlayingInputMode();
  const { sendPlayCountStats } = useSendUserStats();
  const setTabName = useSetTabName();
  const { startTimer } = useTimerControls();

  const setYTStarted = useSetYTStarted();
  const { writeYTStatus } = useReadYTStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readReadyInputMode = useReadReadyInputMode();
  const readPlaySpeed = useReadPlaySpeed();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useReadMap();
  const { readPlayer } = usePlayer();

  return (player: YT.Player) => {
    const { scene } = readGameStateUtils();

    if (scene === "ready") {
      startTimer();
    }

    const movieDuration = player.getDuration();
    writeYTStatus({ movieDuration });

    const { minPlaySpeed } = readPlaySpeed();

    setTimeout(() => readPlayer().setPlaybackRate(minPlaySpeed), 500);

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
    player.seekTo(0, true);
  };
};

export const useOnPlay = () => {
  const setNotify = useSetNotify();
  const { startTimer } = useTimerControls();

  const { readYTStatus, writeYTStatus } = useReadYTStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const onStart = useOnStart();

  return async (player: YT.Player) => {
    windowFocus();

    console.log("再生 1");

    const { scene, isYTStarted } = readGameStateUtils();

    if (!isYTStarted) {
      onStart(player);
    }

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

export const useOnEnd = () => {
  const setScene = useSetScene();
  const { readLineProgress, readTotalProgress } = useProgress();
  const readGameStateUtils = useReadGameUtilParams();
  return () => {
    console.log("終了");

    const lineProgress = readLineProgress();
    const totalProgress = readTotalProgress();

    lineProgress.max = 0;
    totalProgress.value = totalProgress.max;

    const { scene } = readGameStateUtils();

    if (scene === "play") {
      setScene("play_end");
    } else if (scene === "practice") {
      setScene("practice_end");
    } else if (scene === "replay") {
      setScene("replay_end");
    }
  };
};

export const useOnPause = () => {
  const setNotify = useSetNotify();
  const { readYTStatus, writeYTStatus } = useReadYTStatus();
  const { stopTimer: pauseTimer } = useTimerControls();
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

export const useOnSeeked = () => {
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const { writeCount } = useLineCount();

  return (player: YT.Player) => {
    const time = player.getCurrentTime();

    const { isRetrySkip } = readGameUtilRefParams();

    if (isRetrySkip && time === 0) {
      writeCount(0);
    }

    console.log("シーク");
  };
};

export const useOnReady = () => {
  const readVolume = useReadVolume();
  const { writePlayer } = usePlayer();

  return (player: YT.Player) => {
    player.setVolume(readVolume());
    writePlayer(player);
  };
};

export const useOnRateChange = () => {
  const setNotify = useSetNotify();

  const { readLineProgress } = useProgress();
  const readMap = useReadMap();
  const { readCount } = useLineCount();
  const setSpeed = useSetSpeed();

  return (player: YT.Player) => {
    const speed = player.getPlaybackRate();

    setSpeed((prev) => ({ ...prev, playSpeed: speed }));

    setNotify(Symbol(`x${speed.toFixed(2)}`));
    const lineProgress = readLineProgress();
    if (lineProgress) {
      lineProgress.value = 0;
      const map = readMap();
      if (!map) return;
      const count = readCount();

      lineProgress.max = (map.mapData[count].time - (map.mapData[count - 1]?.time ?? 0)) / speed;
    }
  };
};
