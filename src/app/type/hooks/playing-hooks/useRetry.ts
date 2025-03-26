import { RESET } from "jotai/utils";
import { useCountRef, useGameUtilsRef, usePlayer, useStatusRef } from "../../atoms/refAtoms";
import {
  useGameStateUtilsRef,
  useMapStateRef,
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
import { PlayMode } from "../../ts/type";
import { useTimerControls } from "./timer-hooks/useTimer";
import { useSendUserStats } from "./useSendUserStats";

export const useRetry = () => {
  const { readPlayer } = usePlayer();
  const { readGameUtils, writeGameUtils } = useGameUtilsRef();

  const setLineResults = useSetLineResultsState();
  const setCombo = useSetComboState();
  const setNotify = useSetNotifyState();
  const setLyrics = useSetLyricsState();
  const { setNextLyrics } = useSetNextLyricsState();
  const setLineWord = useSetLineWordState();

  const { resetTypingStatus } = useSetTypingStatusState();
  const { sendPlayCountStats, sendTypingStats } = useSendUserStats();
  const { resetStatus } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readMap = useMapStateRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const { writeCount } = useCountRef();

  const { pauseTimer } = useTimerControls();
  return (newPlayMode: PlayMode) => {
    const map = readMap();
    setLineWord(RESET);
    setLyrics("");
    setNextLyrics(map.mapData[1]);

    const { scene } = readGameStateUtils();

    if (scene === "playing" || scene === "practice") {
      sendTypingStats();
    }

    if (scene === "playing") {
      const totalTypeCount = readTypingStatus().type;
      if (totalTypeCount) {
        const retryCount = readGameUtils().retryCount;
        writeGameUtils({ retryCount: retryCount + 1 });
        if (totalTypeCount >= 10) {
          sendPlayCountStats();
        }
      }

      setNotify(Symbol(`Retry(${readGameUtils().retryCount})`));
      setLineResults(structuredClone(map!.defaultLineResultData));
    }

    if (scene != "practice") {
      resetTypingStatus();
      setCombo(0);
      resetStatus();
    }

    writeCount(0);

    const enableRetrySKip = map.mapData[map.startLine].time > 5;

    writeGameUtils({
      playMode: newPlayMode,
      replayKeyCount: 0,
      isRetrySkip: enableRetrySKip,
    });

    readPlayer().seekTo(0, true);

    pauseTimer();
  };
};

export const useProceedRetry = () => {
  const setCombo = useSetComboState();
  const setTabIndex = useSetTabIndexState();

  const setLineResults = useSetLineResultsState();
  const setScene = useSetSceneState();
  const { resetTypingStatus } = useSetTypingStatusState();
  const { sendPlayCountStats } = useSendUserStats();

  const { readPlayer } = usePlayer();
  const { writeGameUtils } = useGameUtilsRef();
  const { resetStatus } = useStatusRef();
  const { writeCount } = useCountRef();
  const readMap = useMapStateRef();

  return (playMode: PlayMode) => {
    const map = readMap();
    setScene(playMode);
    setTabIndex(0);

    if (playMode === "playing" || playMode === "practice") {
      sendPlayCountStats();
    }

    if (playMode === "playing") {
      setLineResults(structuredClone(map.defaultLineResultData));
    }

    if (playMode !== "practice") {
      resetTypingStatus();
      setCombo(0);
      resetStatus();
    }

    writeCount(0);
    const enableRetrySKip = map.mapData[map.startLine].time > 5;

    writeGameUtils({
      replayKeyCount: 0,
      isRetrySkip: enableRetrySKip,
    });

    readPlayer().seekTo(0, true);
    readPlayer().playVideo();
  };
};
