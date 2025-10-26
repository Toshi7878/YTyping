import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useReadVolume } from "@/lib/global-atoms";
import { useTRPC } from "@/trpc/provider";
import { windowFocus } from "@/utils/window-focus";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  usePlayer,
  useProgress,
  useReadYTStatus,
} from "../atoms/read-atoms";
import { useReadPlaySpeed, useSetSpeed } from "../atoms/speed-reducer-atoms";
import {
  useReadGameUtilParams,
  useReadMap,
  useSetNotify,
  useSetPlayingInputMode,
  useSetScene,
  useSetTabName,
  useSetYTStarted,
} from "../atoms/state-atoms";
import { useReadReadyInputMode } from "../atoms/storage-atoms";
import { timerControls } from "../playing/timer/use-timer";
import { useSendUserStats } from "../playing/use-send-user-stats";
import { useUpdateAllStatus } from "../playing/use-update-status";
import type { InputMode } from "../type";

export const useOnStart = () => {
  const setScene = useSetScene();
  const setPlayingInputMode = useSetPlayingInputMode();
  const { sendPlayCountStats } = useSendUserStats();
  const setTabName = useSetTabName();

  const setYTStarted = useSetYTStarted();
  const { writeYTStatus } = useReadYTStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readReadyInputMode = useReadReadyInputMode();
  const readPlaySpeed = useReadPlaySpeed();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useReadMap();

  return (player: YT.Player) => {
    const { scene } = readGameStateUtils();

    if (scene === "ready") {
      timerControls.startTimer();
    }

    const movieDuration = player.getDuration();
    writeYTStatus({ movieDuration });

    const { minPlaySpeed } = readPlaySpeed();

    if (scene !== "replay") {
      if (minPlaySpeed < 1) {
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
      timerControls.startTimer();
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

export const useOnEnd = () => {
  const setScene = useSetScene();
  const { readLineProgress, readTotalProgress } = useProgress();
  const readGameStateUtils = useReadGameUtilParams();
  const trpc = useTRPC();
  const { id: mapId } = useParams<{ id: string }>();

  const incrementUserMapCompletionPlayCount = useMutation(
    trpc.userStats.incrementMapCompletionPlayCount.mutationOptions(),
  );
  return () => {
    console.log("終了");

    const lineProgress = readLineProgress();
    const totalProgress = readTotalProgress();

    lineProgress.value = lineProgress.max;
    totalProgress.value = totalProgress.max;

    const { scene } = readGameStateUtils();

    if (scene === "play") {
      setScene("play_end");
      incrementUserMapCompletionPlayCount.mutate({ mapId: Number(mapId) });
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
  const readGameUtilParams = useReadGameUtilParams();

  return () => {
    console.log("一時停止");

    timerControls.stopTimer();

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

  const setSpeed = useSetSpeed();

  return (player: YT.Player) => {
    const speed = player.getPlaybackRate();

    setSpeed((prev) => ({ ...prev, playSpeed: speed }));

    setNotify(Symbol(`x${speed.toFixed(2)}`));
  };
};
