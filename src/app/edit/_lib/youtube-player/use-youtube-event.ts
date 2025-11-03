import type { YouTubeEvent } from "react-youtube";
import { readVolume } from "@/lib/atoms/global-atoms";
import { useReadMap } from "../atoms/map-reducer-atom";
import { usePlayer, usePreventEditortabAutoFocus } from "../atoms/read-atoms";
import {
  useReadYtPlayerStatus,
  useSetIsYTPlaying,
  useSetIsYTStarted,
  useSetTabName,
  useSetTimeLineIndex,
  useSetYtPlayerStatus,
} from "../atoms/state-atoms";
import { useUpdateEndTime } from "../map-table/use-update-end-time";
import { useTimerControls } from "./use-timer";

export const useOnReady = () => {
  const readYTPlayerStatus = useReadYtPlayerStatus();
  const { writePlayer } = usePlayer();
  const readMap = useReadMap();
  const updateEndTime = useUpdateEndTime();
  const setYTPlayerStatus = useSetYtPlayerStatus();

  return (event: { target: YT.Player }) => {
    console.log("Ready");
    const player = event.target;

    const endLine = readMap().findLast((line) => line.lyrics === "end");
    const { changingVideo } = readYTPlayerStatus();
    const duration = player.getDuration();
    if (changingVideo && duration.toFixed(0) !== Number(endLine?.time).toFixed(0)) {
      updateEndTime(player);
    }

    writePlayer(player);
    player.setVolume(readVolume());

    setYTPlayerStatus((prev) => ({
      ...prev,
      changingVideo: false,
      playing: false,
      readied: true,
      started: false,
      duration,
    }));
  };
};

export const useOnPlay = () => {
  const setIsYTPlaying = useSetIsYTPlaying();
  const setIsYTStarted = useSetIsYTStarted();
  const setTabName = useSetTabName();

  const { startTimer } = useTimerControls();
  const preventEditorTabAutoFocus = usePreventEditortabAutoFocus();

  return () => {
    console.log("再生 1");

    startTimer();
    setIsYTPlaying(true);
    setIsYTStarted(true);

    if (preventEditorTabAutoFocus()) return;
    setTabName("エディター");
  };
};

export const useOnPause = () => {
  const setIsYTPlaying = useSetIsYTPlaying();

  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("一時停止");
    pauseTimer();
    setIsYTPlaying(false);
  };
};

export const useOnEnd = () => {
  const setIsYTPlaying = useSetIsYTPlaying();
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("プレイ終了 動画完全停止");
    pauseTimer();
    setIsYTPlaying(false);
  };
};

export const useOnSeeked = () => {
  const getSeekCount = useGetSeekedLineCount();
  const setTimeLineIndex = useSetTimeLineIndex();

  return (event: YouTubeEvent) => {
    const time = event.target.getCurrentTime();
    console.log(`シークtime: ${time}`);
    setTimeLineIndex(getSeekCount(time));
  };
};

const useGetSeekedLineCount = () => {
  const readMap = useReadMap();

  return (time: number) => {
    let count = 0;

    const map = readMap();
    for (const [i, line] of map.entries()) {
      if (Number(line.time) - time >= 0) {
        count = i - 1;
        break;
      }
    }

    if (count < 0) {
      count = 0;
    }

    return count;
  };
};
