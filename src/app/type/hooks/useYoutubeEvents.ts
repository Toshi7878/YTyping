import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { useStore } from "jotai";
import { YouTubeEvent } from "react-youtube";
import {
  gameStateRefAtom,
  lineProgressRefAtom,
  playerRefAtom,
  totalProgressRefAtom,
  ytStateRefAtom,
} from "../atoms/refAtoms";
import {
  isLoadingOverlayAtom,
  readyRadioInputModeAtom,
  sceneAtom,
  typingStatusAtom,
  useSetPlayingInputModeAtom,
  useSetPlayingNotifyAtom,
  useSetSceneAtom,
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

  return async (event: YouTubeEvent) => {
    console.log("再生 1");
    const scene = typeAtomStore.get(sceneAtom);

    const ytState = typeAtomStore.get(ytStateRefAtom);
    if (scene === "ready") {
      if (ytState) {
        const movieDuration = typeAtomStore.get(playerRefAtom)!.getDuration();
        typeAtomStore.set(ytStateRefAtom, (prev) => ({ ...prev, movieDuration }));
      }

      const playMode = typeAtomStore.get(gameStateRefAtom).playMode;

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

    const isPaused = ytState.isPaused;

    if (isPaused) {
      typeAtomStore.set(ytStateRefAtom, (prev) => ({ ...prev, isPaused: false }));
      setNotify(Symbol("▶"));
    }
  };
};

export const useYTEndEvent = () => {
  const typeAtomStore = useStore();

  return () => {
    console.log("プレイ終了");
    const player = typeAtomStore.get(playerRefAtom);

    player!.seekTo(0, true);
    player!.stopVideo();
  };
};

export const useYTStopEvent = () => {
  const setScene = useSetSceneAtom();
  const typeAtomStore = useStore();
  return () => {
    console.log("動画停止");

    const lineProgress = typeAtomStore.get(lineProgressRefAtom);
    const totalProgress = typeAtomStore.get(totalProgressRefAtom);

    lineProgress!.value = lineProgress!.max;
    totalProgress!.value = totalProgress!.max;
    setScene("end");

    if (typeTicker.started) {
      typeTicker.stop();
    }
  };
};

export const useYTPauseEvent = () => {
  const setNotify = useSetPlayingNotifyAtom();
  const typeAtomStore = useStore();

  return () => {
    console.log("一時停止");

    if (typeTicker.started) {
      typeTicker.stop();
    }

    const isPaused = typeAtomStore.get(ytStateRefAtom).isPaused;
    if (!isPaused) {
      typeAtomStore.set(ytStateRefAtom, (prev) => ({ ...prev, isPaused: true }));
      setNotify(Symbol("ll"));
    }
  };
};

export const useYTSeekEvent = () => {
  const typeAtomStore = useStore();

  return () => {
    const time = typeAtomStore.get(playerRefAtom)!.getCurrentTime();
    const isRetrySkip = typeAtomStore.get(gameStateRefAtom).isRetrySkip;

    if (isRetrySkip && time === 0) {
      typeAtomStore.set(typingStatusAtom, (prev) => ({ ...prev, count: 0 }));
    }
    console.log("シーク");
  };
};

export const useYTReadyEvent = () => {
  const volumeAtom = useVolumeAtom();
  const typeAtomStore = useStore();

  return (event) => {
    const player = event.target;
    typeAtomStore.set(playerRefAtom, player);
    player.setVolume(volumeAtom);
  };
};
