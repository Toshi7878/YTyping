import { RESET } from "jotai/utils";
import { useGameUtilsRef, usePlayer, useStatusRef } from "../../atoms/refAtoms";
import {
  useMapState,
  useSceneStateRef,
  useSetComboState,
  useSetLineResultsState,
  useSetLineWordState,
  useSetLyricsState,
  useSetNextLyricsState,
  useSetNotifyState,
  useSetSceneState,
  useSetTabIndexState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "../../atoms/stateAtoms";
import { typeTicker } from "../../ts/const/consts";
import { PlayMode } from "../../ts/type";
import { useUpdateUserStats } from "./useUpdateUserStats";

export const useRetry = () => {
  const map = useMapState();
  const { readPlayer } = usePlayer();
  const { readGameUtils, writeGameUtils } = useGameUtilsRef();

  const setLineResults = useSetLineResultsState();
  const setCombo = useSetComboState();
  const setNotify = useSetNotifyState();
  const setLyrics = useSetLyricsState();
  const setNextLyrics = useSetNextLyricsState();
  const setLineWord = useSetLineWordState();

  const { resetTypingStatus } = useSetTypingStatusState();
  const { updatePlayCountStats, updateTypingStats } = useUpdateUserStats();
  const { resetStatusRef } = useStatusRef();
  const readScene = useSceneStateRef();
  const readTypingStatus = useTypingStatusStateRef();

  return (newPlayMode: PlayMode) => {
    setLineWord(RESET);
    setLyrics("");
    setNextLyrics(RESET);

    const scene = readScene();

    if (scene === "playing") {
      const totalTypeCount = readTypingStatus().type;
      if (totalTypeCount) {
        const retryCount = readGameUtils().retryCount;
        writeGameUtils({ retryCount: retryCount + 1 });
        if (totalTypeCount >= 10) {
          updatePlayCountStats();
        }
      }

      updateTypingStats();
      setNotify(Symbol(`Retry(${readGameUtils().retryCount})`));
      setLineResults(structuredClone(map!.defaultLineResultData));
      resetStatusRef();
      resetTypingStatus();
      setCombo(0);
    }

    const startTime = map.mapData[map.startLine].time;

    writeGameUtils({
      playMode: newPlayMode,
      replayKeyCount: 0,
      isRetrySkip: startTime > 5 ? true : false,
    });

    readPlayer().seekTo(0, true);

    if (typeTicker.started) {
      typeTicker.stop();
    }
  };
};

export const useProceedRetry = () => {
  const setCombo = useSetComboState();
  const setTabIndex = useSetTabIndexState();

  const map = useMapState();

  const setLineResults = useSetLineResultsState();
  const setScene = useSetSceneState();
  const { resetTypingStatus } = useSetTypingStatusState();
  const { updatePlayCountStats } = useUpdateUserStats();

  const { readPlayer } = usePlayer();
  const { writeGameUtils } = useGameUtilsRef();
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

    writeGameUtils({
      replayKeyCount: 0,
      isRetrySkip: true,
    });

    readPlayer().seekTo(0, true);
    readPlayer().playVideo();
  };
};
