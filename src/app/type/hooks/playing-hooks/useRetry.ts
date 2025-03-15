import { useStore } from "jotai";
import { CreateMap } from "../../../../lib/instanceMapData";
import { useGameRef, usePlayer, useStatusRef } from "../../atoms/refAtoms";
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
  const { readPlayer } = usePlayer();
  const { readGameRef, writeGameRef } = useGameRef();

  const setLineResults = useSetLineResultsAtom();
  const setCombo = useSetComboAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const setLyrics = useSetLyricsAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const setLineWord = useSetLineWordAtom();

  const { resetTypingStatus } = useSetTypingStatusAtoms();
  const { updatePlayCountStats, updateTypingStats } = useUpdateUserStats();
  const { readStatusRef, resetStatusRef } = useStatusRef();

  return (newPlayMode: PlayMode) => {
    setLineWord(structuredClone(defaultLineWord));
    setLyrics("");
    setNextLyrics(structuredClone(defaultNextLyrics));

    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "playing") {
      const totalTypeCount = typeAtomStore.get(focusTypingStatusAtoms.type);
      if (totalTypeCount) {
        const retryCount = readGameRef().retryCount;
        writeGameRef({ retryCount: retryCount + 1 });
        if (totalTypeCount >= 10) {
          updatePlayCountStats();
        }
      }

      updateTypingStats();
      setNotify(Symbol(`Retry(${readGameRef().retryCount})`));
      setLineResults(structuredClone(map!.defaultLineResultData));
      resetStatusRef();
      resetTypingStatus();
      setCombo(0);
    }

    writeGameRef({
      playMode: newPlayMode,
      replayKeyCount: 0,
      isRetrySkip: true,
    });

    readPlayer().seekTo(0, true);

    if (typeTicker.started) {
      typeTicker.stop();
    }
  };
};

export const useProceedRetry = () => {
  const setCombo = useSetComboAtom();
  const typeAtomStore = useStore();
  const setTabIndex = useSetTabIndexAtom();

  const map = useMapAtom() as CreateMap;

  const setLineResults = useSetLineResultsAtom();
  const setScene = useSetSceneAtom();
  const { resetTypingStatus } = useSetTypingStatusAtoms();
  const { updatePlayCountStats } = useUpdateUserStats();

  const { readPlayer } = usePlayer();
  const { writeGameRef } = useGameRef();
  const { resetStatusRef } = useStatusRef();

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
      resetStatusRef();
    }

    writeGameRef({
      replayKeyCount: 0,
      isRetrySkip: true,
    });

    readPlayer().seekTo(0, true);
    readPlayer().playVideo();
  };
};
