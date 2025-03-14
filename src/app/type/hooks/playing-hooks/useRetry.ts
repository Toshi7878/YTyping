import { useStore } from "jotai";
import { RESET } from "jotai/utils";
import { CreateMap } from "../../../../lib/instanceMapData";
import { gameStateRefAtom, typingStatusRefAtom, usePlayer } from "../../atoms/refAtoms";
import {
  focusTypingStatusAtoms,
  sceneAtom,
  useMapAtom,
  useSetComboAtom,
  useSetLineResultsAtom,
  useSetLineWordAtom,
  useSetLyricsAtom,
  useSetNextLyricsAtom,
  useSetPlayingNotifyAtom,
  useSetSceneAtom,
  useSetTabIndexAtom,
  useSetTypingStatusAtoms,
} from "../../atoms/stateAtoms";
import { defaultLineWord, defaultNextLyrics, typeTicker } from "../../ts/const/consts";
import { PlayMode } from "../../ts/type";
import { useUpdateUserStats } from "./useUpdateUserStats";

export const useRetry = () => {
  const map = useMapAtom();
  const typeAtomStore = useStore();
  const player = usePlayer();

  const setLineResults = useSetLineResultsAtom();
  const setCombo = useSetComboAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const setLyrics = useSetLyricsAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const setLineWord = useSetLineWordAtom();

  const { resetTypingStatus } = useSetTypingStatusAtoms();
  const { updatePlayCountStats, updateTypingStats } = useUpdateUserStats();

  return (newPlayMode: PlayMode) => {
    setLineWord(structuredClone(defaultLineWord));
    setLyrics("");
    setNextLyrics(structuredClone(defaultNextLyrics));

    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "playing") {
      const totalTypeCount = typeAtomStore.get(focusTypingStatusAtoms.type);
      if (totalTypeCount) {
        typeAtomStore.set(gameStateRefAtom, (prev) => ({ ...prev, retryCount: prev.retryCount++ }));
        if (totalTypeCount >= 10) {
          updatePlayCountStats();
        }
      }

      updateTypingStats();
      const retryCount = typeAtomStore.get(gameStateRefAtom).replay.replayKeyCount;
      setNotify(Symbol(`Retry(${retryCount})`));
      setLineResults(structuredClone(map!.defaultLineResultData));
      typeAtomStore.set(typingStatusRefAtom, RESET);
      resetTypingStatus();
      setCombo(0);
    }

    typeAtomStore.set(gameStateRefAtom, (prev) => ({
      ...prev,
      playMode: newPlayMode,
      replay: { ...prev.replay, replayKeyCount: 0 },
      isRetrySkip: true,
    }));

    player.seekTo(0, true);

    if (typeTicker.started) {
      typeTicker.stop();
    }
  };
};

export const useProceedRetry = () => {
  const player = usePlayer();
  const setCombo = useSetComboAtom();
  const typeAtomStore = useStore();
  const setTabIndex = useSetTabIndexAtom();

  const map = useMapAtom() as CreateMap;
  const setLineResults = useSetLineResultsAtom();
  const setScene = useSetSceneAtom();
  const { resetTypingStatus } = useSetTypingStatusAtoms();
  const { updatePlayCountStats } = useUpdateUserStats();

  return (playMode: PlayMode) => {
    setScene(playMode);
    setTabIndex(0);

    if (playMode === "playing" || playMode === "practice") {
      updatePlayCountStats();
    }

    if (playMode === "playing") {
      setLineResults(structuredClone(map.defaultLineResultData));
    }

    if (playMode !== "practice") {
      resetTypingStatus();
      setCombo(0);

      typeAtomStore.set(typingStatusRefAtom, RESET);
    }
    typeAtomStore.set(gameStateRefAtom, (prev) => ({
      ...prev,
      replay: { ...prev.replay, replayKeyCount: 0 },
      isRetrySkip: true,
    }));

    player.seekTo(0, true);
    player.playVideo();
  };
};
