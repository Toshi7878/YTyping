import type { YouTubeEvent } from "react-youtube";
import { readVolume } from "@/lib/atoms/global-atoms";
import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { windowFocus } from "@/utils/window-focus";
import { readMapId } from "../atoms/hydrate";
import { readLineProgress, readTotalProgress, readUtilityRefParams, writeLineCount } from "../atoms/ref";
import {
  readMinMediaSpeed,
  readSceneGroup,
  readUtilityParams,
  setIsPaused,
  setMediaSpeed,
  setMovieDuration,
  setNotify,
  setPlayingInputMode,
  setScene,
  setTabName,
  setYTStarted,
} from "../atoms/state";
import { readReadyInputMode } from "../atoms/storage";
import { writeYTPlayer } from "../atoms/youtube-player";
import { mutateIncrementMapCompletionPlayCountStats, mutateTypingStats } from "../mutate/stats";
import { startTimer, stopTimer } from "../playing/timer/timer";

const onStart = (player: YT.Player) => {
  const { scene } = readUtilityParams();
  setMovieDuration(player.getDuration());
  const mapId = readMapId();
  if (mapId) {
    mutatePlayCountStats({ mapId });
  }
  setTabName("ステータス");
  setYTStarted(true);
  player.seekTo(0, true);
  if (scene === "replay") return;

  const minMediaSpeed = readMinMediaSpeed();
  if (minMediaSpeed < 1) {
    setScene("practice");
  } else if (scene === "ready") {
    setScene("play");
  }

  const readyInputMode = readReadyInputMode();
  setPlayingInputMode(readyInputMode);
};

export const onPlay = async ({ target: player }: { target: YT.Player }) => {
  windowFocus();

  console.log("再生 1");

  const { scene, isYTStarted, isPaused } = readUtilityParams();
  const sceneGroup = readSceneGroup();

  if (sceneGroup === "Ready" || sceneGroup === "Playing") {
    startTimer();
  }

  if (!isYTStarted) {
    onStart(player);
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
    mutateTypingStats();
    mutateIncrementMapCompletionPlayCountStats();
  } else if (scene === "practice") {
    setScene("practice_end");
    mutateTypingStats();
  } else if (scene === "replay") {
    setScene("replay_end");
  }
};

export const onPause = () => {
  console.log("一時停止");

  stopTimer();

  const { isPaused, scene } = readUtilityParams();
  if (!isPaused) {
    setIsPaused(true);
    if (scene === "practice") return;
    setNotify(Symbol("ll"));
  }
};

const onSeeked = (player: YT.Player) => {
  const time = player.getCurrentTime();

  const { isRetrySkip } = readUtilityRefParams();

  if (isRetrySkip && time === 0) {
    writeLineCount(0);
  }

  console.log("シーク");
};

export const onReady = ({ target: player }: { target: YT.Player }) => {
  player.setVolume(readVolume());
  writeYTPlayer(player);
};

export const onPlaybackRateChange = ({ target: player }: { target: YT.Player }) => {
  const nextSpeed = player.getPlaybackRate();
  setMediaSpeed(nextSpeed);
  setNotify(Symbol(`x${nextSpeed.toFixed(2)}`));
};

export const onStateChange = (event: YouTubeEvent) => {
  if (event.data === YT.PlayerState.BUFFERING) {
    onSeeked(event.target as YT.Player);
  }
};
