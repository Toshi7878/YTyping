import { useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { YouTubeEvent } from "react-youtube";
import { useEditUtilsParams, usePlayer } from "../atoms/refAtoms";
import {
  useSetIsYTPlaying,
  useSetIsYTReadied,
  useSetIsYTStarted,
  useSetTabName,
  useSetTimeCount,
} from "../atoms/stateAtoms";
import { useGetSeekCount } from "./useGetSeekCount";
import { useTimerControls } from "./useTimer";

export const useYTReadyEvent = () => {
  const setIsYTReadied = useSetIsYTReadied();
  const volume = useVolumeState();

  const { writePlayer } = usePlayer();
  return (event) => {
    const player = event.target as YTPlayer;

    writePlayer(player);
    player.setVolume(volume);
    setIsYTReadied(true);
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
  const setTimeCount = useSetTimeCount();

  return (event: YouTubeEvent) => {
    const time = event.target.getCurrentTime();
    console.log(`シークtime: ${time}`);
    setTimeCount(getSeekCount(time));
  };
};
