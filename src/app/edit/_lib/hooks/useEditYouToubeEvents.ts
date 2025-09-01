import { useVolumeState } from "@/lib/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { YouTubeEvent } from "react-youtube";
import { useReadMap } from "../atoms/mapReducerAtom";
import { useEditUtilsParams, usePlayer } from "../atoms/refAtoms";
import {
  useReadYtPlayerStatus,
  useSetIsYTPlaying,
  useSetIsYTStarted,
  useSetTabName,
  useSetTimeLineIndex,
  useSetYtPlayerStatus,
} from "../atoms/stateAtoms";
import { useGetSeekCount } from "./useGetSeekCount";
import { useTimerControls } from "./useTimer";
import { useUpdateEndTime } from "./useUpdateEndTime";

export const useYTReadyEvent = () => {
  const volume = useVolumeState();
  const readYTPlayerStatus = useReadYtPlayerStatus();
  const { writePlayer } = usePlayer();
  const readMap = useReadMap();
  const updateEndTime = useUpdateEndTime();
  const setYTPlayerStatus = useSetYtPlayerStatus();

  return (event: { target: YTPlayer }) => {
    console.log("Ready");
    const player = event.target;

    const endLine = readMap().findLast((line) => line.lyrics === "end");
    const { changingVideo } = readYTPlayerStatus();
    const duration = player.getDuration();
    if (changingVideo && duration.toFixed(0) !== Number(endLine?.time).toFixed(0)) {
      updateEndTime(player);
    }

    writePlayer(player);
    player.setVolume(volume);

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

export const useYTPlayEvent = () => {
  const setIsYTPlaying = useSetIsYTPlaying();
  const setIsYTStarted = useSetIsYTStarted();
  const setTabName = useSetTabName();

  const { readEditUtils, writeEditUtils } = useEditUtilsParams();
  const { startTimer } = useTimerControls();

  return () => {
    console.log("再生 1");

    startTimer();
    setIsYTPlaying(true);
    setIsYTStarted(true);

    const { preventAutoTabToggle } = readEditUtils();
    if (preventAutoTabToggle) {
      writeEditUtils({ preventAutoTabToggle: false });
      return;
    }
    setTabName("エディター");
  };
};

export const useYTPauseEvent = () => {
  const setIsYTPlaying = useSetIsYTPlaying();

  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("一時停止");
    pauseTimer();
    setIsYTPlaying(false);
  };
};

export const useYTEndStopEvent = () => {
  const setIsYTPlaying = useSetIsYTPlaying();
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("プレイ終了 動画完全停止");
    pauseTimer();
    setIsYTPlaying(false);
  };
};

export const useYTSeekEvent = () => {
  const getSeekCount = useGetSeekCount();
  const setTimeLineIndex = useSetTimeLineIndex();

  return (event: YouTubeEvent) => {
    const time = event.target.getCurrentTime();
    console.log(`シークtime: ${time}`);
    setTimeLineIndex(getSeekCount(time));
  };
};
