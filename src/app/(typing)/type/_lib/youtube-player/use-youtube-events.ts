import { readVolume } from "@/lib/atoms/global-atoms";
import { trpcClient } from "@/trpc/provider";
import { windowFocus } from "@/utils/window-focus";
import {
  readLineProgress,
  readMapId,
  readTotalProgress,
  readUtilityRefParams,
  writeLineCount,
  writeYTPlayer,
} from "../atoms/ref";
import { readPlaySpeed, setSpeed } from "../atoms/speed-reducer";
import {
  readBuiltMap,
  readUtilityParams,
  setIsPaused,
  setMovieDuration,
  setNotify,
  setPlayingInputMode,
  setScene,
  setTabName,
  setYTStarted,
} from "../atoms/state";
import { readReadyInputMode } from "../atoms/storage";
import { mutatePlayCountStats } from "../playing/mutate-stats";
import { timerControls } from "../playing/timer/timer";
import { recalculateStatusFromResults } from "../playing/update-status/recalc-from-results";
import type { InputMode } from "../type";

const onStart = (player: YT.Player) => {
  const { scene } = readUtilityParams();

  if (scene === "ready") {
    timerControls.startTimer();
  }

  const movieDuration = player.getDuration();
  setMovieDuration(movieDuration);

  const { minPlaySpeed } = readPlaySpeed();

  if (scene !== "replay") {
    if (minPlaySpeed < 1) {
      setScene("practice");
    } else if (scene === "ready") {
      setScene("play");
    }

    const readyInputMode = readReadyInputMode();
    setPlayingInputMode(readyInputMode.replace(/""/g, '"') as InputMode);
    const map = readBuiltMap();
    if (map && scene === "practice") {
      recalculateStatusFromResults({ count: map.mapData.length - 1, updateType: "lineUpdate" });
    }
  }

  mutatePlayCountStats();
  setTabName("ステータス");
  setYTStarted(true);
  player.seekTo(0, true);
};

export const onPlay = async (player: YT.Player) => {
  windowFocus();

  console.log("再生 1");

  const { scene, isYTStarted, isPaused } = readUtilityParams();

  if (!isYTStarted) {
    onStart(player);
  }

  if (scene === "play" || scene === "practice" || scene === "replay") {
    timerControls.startTimer();
  }

  if (isPaused) {
    setIsPaused(false);

    if (scene !== "practice") {
      setNotify(Symbol("▶"));
    }
  }
};

export const onEnd = () => {
  console.log("終了");

  const lineProgress = readLineProgress();
  const totalProgress = readTotalProgress();

  if (lineProgress) {
    lineProgress.value = lineProgress.max;
  }
  if (totalProgress) {
    totalProgress.value = totalProgress.max;
  }

  const { scene } = readUtilityParams();

  if (scene === "play") {
    setScene("play_end");
    const mapId = readMapId();
    void trpcClient.userStats.incrementMapCompletionPlayCount.mutate({ mapId });
  } else if (scene === "practice") {
    setScene("practice_end");
  } else if (scene === "replay") {
    setScene("replay_end");
  }
};

export const onPause = () => {
  console.log("一時停止");

  timerControls.stopTimer();

  const { isPaused, scene } = readUtilityParams();
  if (!isPaused) {
    setIsPaused(true);
    if (scene === "practice") return;
    setNotify(Symbol("ll"));
  }
};

export const onSeeked = (player: YT.Player) => {
  const time = player.getCurrentTime();

  const { isRetrySkip } = readUtilityRefParams();

  if (isRetrySkip && time === 0) {
    writeLineCount(0);
  }

  console.log("シーク");
};

export const onReady = (player: YT.Player) => {
  player.setVolume(readVolume());
  writeYTPlayer(player);
};

export const onRateChange = (player: YT.Player) => {
  const speed = player.getPlaybackRate();
  setSpeed((prev) => ({ ...prev, playSpeed: speed }));
  setNotify(Symbol(`x${speed.toFixed(2)}`));
};
