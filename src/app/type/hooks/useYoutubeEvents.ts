import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { useStore } from "jotai";
import { YouTubeEvent } from "react-youtube";
import { typeTicker } from "../ts/const/consts";
import { InputModeType } from "../ts/type";
import {
  isLoadingOverlayAtom,
  readyRadioInputModeAtom,
  sceneAtom,
  useSetPlayingInputModeAtom,
  useSetPlayingNotifyAtom,
  useSetSceneAtom,
} from "../type-atoms/gameRenderAtoms";
import { useRefs } from "../type-contexts/refsProvider";
import { useStartTimer } from "./playing-hooks/timer-hooks/useStartTimer";
import { useUpdateUserStats } from "./playing-hooks/useUpdateUserStats";

export const useYTPlayEvent = () => {
  const { ytStateRef, playerRef, gameStateRef } = useRefs();
  const typeAtomStore = useStore();
  const setScene = useSetSceneAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const startTimer = useStartTimer();
  const setPlayingInputMode = useSetPlayingInputModeAtom();

  const { updatePlayCountStats } = useUpdateUserStats();

  return async (event: YouTubeEvent) => {
    console.log("再生 1");
    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "ready") {
      if (ytStateRef.current) {
        ytStateRef.current.movieDuration = playerRef.current!.getDuration();
      }

      const playMode = gameStateRef.current!.playMode;

      const isPlayDataLoad = typeAtomStore.get(isLoadingOverlayAtom);

      if (isPlayDataLoad) {
        event.target.pauseVideo();
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
    }

    if (scene === "playing" || scene === "practice" || scene === "replay") {
      startTimer();
    }

    const isPaused = ytStateRef.current!.isPaused;

    if (isPaused) {
      ytStateRef.current!.isPaused = false;
      setNotify(Symbol("▶"));
    }
  };
};

export const useYTEndEvent = () => {
  const { playerRef } = useRefs();

  return () => {
    console.log("プレイ終了");

    playerRef.current!.seekTo(0, true);
    playerRef.current!.stopVideo();
  };
};

export const useYTStopEvent = () => {
  const setScene = useSetSceneAtom();
  const { lineProgressRef, totalProgressRef } = useRefs();
  return () => {
    console.log("動画停止");
    lineProgressRef.current!.value = lineProgressRef.current!.max;
    totalProgressRef.current!.value = totalProgressRef.current!.max;

    setScene("end");

    if (typeTicker.started) {
      typeTicker.stop();
    }
  };
};

export const useYTPauseEvent = () => {
  const { ytStateRef } = useRefs();
  const setNotify = useSetPlayingNotifyAtom();

  return () => {
    console.log("一時停止");

    if (typeTicker.started) {
      typeTicker.stop();
    }

    const isPaused = ytStateRef.current!.isPaused;
    if (!isPaused) {
      ytStateRef.current!.isPaused = true;
      setNotify(Symbol("ll"));
    }
  };
};

export const useYTSeekEvent = () => {
  const { gameStateRef, statusRef, playerRef } = useRefs();

  return () => {
    const time = playerRef.current!.getCurrentTime();
    const isRetrySkip = gameStateRef.current!.isRetrySkip;

    if (isRetrySkip && time === 0) {
      statusRef.current!.status.count = 0;
    }
    console.log("シーク");
  };
};

export const useYTReadyEvent = () => {
  const { setRef } = useRefs();
  const volumeAtom = useVolumeAtom();

  return (event: YouTubeEvent) => {
    const player = event.target;
    setRef("playerRef", player);
    player.setVolume(volumeAtom);
  };
};
