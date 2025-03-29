import { useCountRef, useGameUtilsRef, usePlayer, useStatusRef } from "../../atoms/refAtoms";
import {
  useGameStateUtilsRef,
  useMapStateRef,
  useSetComboState,
  useSetCurrentLineState,
  useSetLineResultsState,
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
  const { setNextLyrics } = useSetNextLyricsState();

  const { resetTypingStatus } = useSetTypingStatusState();
  const { sendPlayCountStats, sendTypingStats } = useSendUserStats();
  const { resetStatus } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readMap = useMapStateRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const { writeCount } = useCountRef();
  const { resetCurrentLine } = useSetCurrentLineState();
  const setTabIndex = useSetTabIndexState();

  const setScene = useSetSceneState();

  const { pauseTimer } = useTimerControls();
  return (newPlayMode: PlayMode) => {
    const map = readMap();
    resetCurrentLine();
    setNextLyrics(map.mapData[1]);
    writeCount(0);

    const enableRetrySKip = map.mapData[map.startLine].time > 5;

    writeGameUtils({
      replayKeyCount: 0,
      isRetrySkip: enableRetrySKip,
    });

    const { scene } = readGameStateUtils();
    if (scene === "play" || scene === "practice") {
      sendTypingStats();
    }

    switch (scene) {
      case "play": {
        const { type: totalTypeCount } = readTypingStatus();
        if (totalTypeCount) {
          const retryCount = readGameUtils().retryCount;
          writeGameUtils({ retryCount: retryCount + 1 });
          if (totalTypeCount >= 10) {
            sendPlayCountStats();
          }
        }

        setNotify(Symbol(`Retry(${readGameUtils().retryCount})`));
        break;
      }
      case "play_end":
      case "practice_end":
      case "replay_end": {
        setTabIndex(0);

        if (newPlayMode === "play" || newPlayMode === "practice") {
          sendPlayCountStats();
        }
        setNotify(Symbol(""));
        break;
      }
    }

    setScene(newPlayMode);

    if (newPlayMode === "play") {
      setLineResults(structuredClone(map.defaultLineResultData));
    }

    if (newPlayMode !== "practice") {
      resetTypingStatus();
      setCombo(0);
      resetStatus();
    }

    if (newPlayMode !== "replay") {
      writeGameUtils({ replayUserName: "" });
    }

    readPlayer().seekTo(0, true);
    pauseTimer();
    readPlayer().playVideo();
  };
};
