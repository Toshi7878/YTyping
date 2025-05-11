import { usegameUtilityReferenceParams, useLineCount, usePlayer, useTypingDetails } from "../../atoms/refAtoms";
import {
  useReadGameUtilParams,
  useReadMapState,
  useReadTypingStatus,
  useSetCombo,
  useSetCurrentLine,
  useSetLineResults,
  useSetNextLyrics,
  useSetNotify,
  useSetScene,
  useSetTabIndex,
  useSetTypingStatus,
} from "../../atoms/stateAtoms";
import { PlayMode } from "../../ts/type";
import { useSendUserStats } from "./sendUserStats";
import { useTimerControls } from "./timer-hooks/timer";

export const useRetry = () => {
  const { readPlayer } = usePlayer();
  const { readGameUtilRefParams, writeGameUtilRefParams } = usegameUtilityReferenceParams();

  const setLineResults = useSetLineResults();
  const setCombo = useSetCombo();
  const setNotify = useSetNotify();
  const { setNextLyrics } = useSetNextLyrics();

  const { resetTypingStatus } = useSetTypingStatus();
  const { sendPlayCountStats, sendTypingStats } = useSendUserStats();
  const { resetStatus } = useTypingDetails();
  const readTypingStatus = useReadTypingStatus();
  const readMap = useReadMapState();
  const readGameStateUtils = useReadGameUtilParams();
  const { writeCount } = useLineCount();
  const { resetCurrentLine } = useSetCurrentLine();
  const setTabIndex = useSetTabIndex();

  const setScene = useSetScene();

  const { pauseTimer } = useTimerControls();
  return (newPlayMode: PlayMode) => {
    const map = readMap();
    resetCurrentLine();
    setNextLyrics(map.mapData[1]);
    writeCount(0);

    const enableRetrySKip = map.mapData[map.startLine].time > 5;

    writeGameUtilRefParams({
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
          const retryCount = readGameUtilRefParams().retryCount;
          writeGameUtilRefParams({ retryCount: retryCount + 1 });
          if (totalTypeCount >= 10) {
            sendPlayCountStats();
          }
        }

        setNotify(Symbol(`Retry(${readGameUtilRefParams().retryCount})`));
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
      setLineResults(structuredClone(map.initialLineResultData));
    }

    if (newPlayMode !== "practice") {
      resetTypingStatus();
      setCombo(0);
      resetStatus();
    }

    if (newPlayMode !== "replay") {
      writeGameUtilRefParams({ replayUserName: "" });
    }

    readPlayer().seekTo(0, true);
    pauseTimer();
    readPlayer().playVideo();
  };
};
