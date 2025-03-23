import { useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YouTubeEvent, YTPlayer } from "@/types/global-types";
import { useEditUtilsRef, usePlayer } from "../atoms/refAtoms";
import {
  useSetIsYTPlayingState,
  useSetIsYTReadiedState,
  useSetIsYTStartedState,
  useSetTabIndexState,
} from "../atoms/stateAtoms";
import { useTimerControls } from "./useTimer";
import { useUpdateCurrentTimeLine } from "./useUpdateCurrentTimeLine";
import { useGetSeekCount } from "./utils/useGetSeekCount";

export const useYTReadyEvent = () => {
  const setIsYTReadied = useSetIsYTReadiedState();
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
  const setIsYTPlaying = useSetIsYTPlayingState();
  const setIsYTStarted = useSetIsYTStartedState();
  const setTabIndex = useSetTabIndexState();

  const { readEditUtils, writeEditUtils } = useEditUtilsRef();
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
    setTabIndex(1);
  };
};

export const useYTPauseEvent = () => {
  const setIsYTPlaying = useSetIsYTPlayingState();

  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("一時停止");
    pauseTimer();
    setIsYTPlaying(false);
  };
};

export const useYTEndStopEvent = () => {
  const setIsYTPlaying = useSetIsYTPlayingState();
  const { pauseTimer } = useTimerControls();

  return () => {
    console.log("プレイ終了 動画完全停止");
    pauseTimer();
    setIsYTPlaying(false);
  };
};

export const useYTSeekEvent = () => {
  const getSeekCount = useGetSeekCount();
  const updateCurrentLine = useUpdateCurrentTimeLine();

  return (event: YouTubeEvent) => {
    const time = event.target.getCurrentTime();
    console.log(`シークtime: ${time}`);
    updateCurrentLine(getSeekCount(time));
  };
};
