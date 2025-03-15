import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { useStore } from "jotai";
import { YouTubeEvent } from "react-youtube";
import { useGameRef, usePlayer, useProgress, useYTStatusRef } from "../atoms/refAtoms";
import {
  isLoadingOverlayAtom,
  readyRadioInputModeAtom,
  sceneAtom,
  typingStatusAtom,
  useSetPlayingInputModeAtom,
  useSetPlayingNotifyAtom,
  useSetSceneAtom,
  useSetTabIndexAtom,
} from "../atoms/stateAtoms";
import { typeTicker } from "../ts/const/consts";
import { InputModeType } from "../ts/type";
import { useStartTimer } from "./playing-hooks/timer-hooks/useStartTimer";
import { useUpdateUserStats } from "./playing-hooks/useUpdateUserStats";

export const useYTPlayEvent = () => {
  const typeAtomStore = useStore();
  const setScene = useSetSceneAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const startTimer = useStartTimer();
  const setPlayingInputMode = useSetPlayingInputModeAtom();
  const { updatePlayCountStats } = useUpdateUserStats();
  const setTabIndex = useSetTabIndexAtom();

  const { readPlayer } = usePlayer();
  const { readGameRef } = useGameRef();
  const { readYTStatusRef, writeYTStatusRef } = useYTStatusRef();

  return async (event: YouTubeEvent) => {
    console.log("再生 1");
    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "ready") {
      const movieDuration = readPlayer().getDuration();
      writeYTStatusRef({ movieDuration });

      const playMode = readGameRef().playMode;

      const isPlayDataLoad = typeAtomStore.get(isLoadingOverlayAtom);

      if (isPlayDataLoad) {
        readPlayer().pauseVideo();
        return;
      }

      if (playMode === "replay") {
        setScene("replay");
      } else if (playMode === "practice") {
        setScene("practice");
      } else {
        setScene("playing");
      }

      const readyInputMode = typeAtomStore.get(readyRadioInputModeAtom);
      setPlayingInputMode(readyInputMode.replace(/""/g, '"') as InputModeType);
      updatePlayCountStats();
      setTabIndex(0);
    }

    if (scene === "playing" || scene === "practice" || scene === "replay") {
      startTimer();
    }

    const isPaused = readYTStatusRef().isPaused;

    if (isPaused) {
      writeYTStatusRef({ isPaused: false });
      setNotify(Symbol("▶"));
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

export const useYTStopEvent = () => {
  const setScene = useSetSceneAtom();
  const { readLineProgress, readTotalProgress } = useProgress();

  return () => {
    console.log("動画停止");

    const lineProgress = readLineProgress();
    const totalProgress = readTotalProgress();

    lineProgress.value = lineProgress.max;
    totalProgress.value = totalProgress.max;
    setScene("end");

    if (typeTicker.started) {
      typeTicker.stop();
    }
  };
};

export const useYTPauseEvent = () => {
  const setNotify = useSetPlayingNotifyAtom();
  const { readYTStatusRef, writeYTStatusRef } = useYTStatusRef();

  return () => {
    console.log("一時停止");

    if (typeTicker.started) {
      typeTicker.stop();
    }

    const isPaused = readYTStatusRef().isPaused;
    if (!isPaused) {
      writeYTStatusRef({ isPaused: true });
      setNotify(Symbol("ll"));
    }
  };
};

export const useYTSeekEvent = () => {
  const typeAtomStore = useStore();
  const { readPlayer } = usePlayer();
  const { readGameRef } = useGameRef();

  return () => {
    const time = readPlayer().getCurrentTime();

    const isRetrySkip = readGameRef().isRetrySkip;

    if (isRetrySkip && time === 0) {
      typeAtomStore.set(typingStatusAtom, (prev) => ({ ...prev, count: 0 }));
    }
    console.log("シーク");
  };
};

export const useYTReadyEvent = () => {
  const volumeAtom = useVolumeAtom();
  const { writePlayer } = usePlayer();

  return (event) => {
    const player = event.target as YTPlayer;
    player.setVolume(volumeAtom);
    writePlayer(player);
  };
};
