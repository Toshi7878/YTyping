import {
  useGameUtilityReferenceParams,
  useLineCount,
  useLineStatus,
  usePlayer,
  useTypingSubstatusReference,
} from "../atoms/read-atoms";
import {
  useInitializeLineResults,
  useReadGameUtilityParams,
  useReadMap,
  useReadTypingStatus,
  useSetCombo,
  useSetCurrentLine,
  useSetNextLyrics,
  useSetNotify,
  useSetScene,
  useSetTabName,
  useSetTypingStatus,
} from "../atoms/state-atoms";
import type { PlayMode } from "../type";
import { timerControls } from "./timer/use-timer";
import { useSendUserStats } from "./use-send-user-stats";

export const useRetry = () => {
  const { readPlayer } = usePlayer();
  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();

  const initializeLineResults = useInitializeLineResults();
  const setCombo = useSetCombo();
  const setNotify = useSetNotify();
  const { setNextLyrics } = useSetNextLyrics();

  const { resetTypingStatus } = useSetTypingStatus();
  const { sendPlayCountStats, sendTypingStats } = useSendUserStats();
  const { resetStatus } = useTypingSubstatusReference();
  const { resetLineStatus } = useLineStatus();

  const readTypingStatus = useReadTypingStatus();
  const readMap = useReadMap();
  const readGameUtilityParams = useReadGameUtilityParams();
  const { writeCount } = useLineCount();
  const { resetCurrentLine } = useSetCurrentLine();
  const setTabName = useSetTabName();

  const setScene = useSetScene();

  return (newPlayMode: PlayMode) => {
    const map = readMap();
    const nextLine = map?.mapData[1];
    const startLine = map?.mapData[map.startLine];
    if (!nextLine || !startLine) return;
    resetCurrentLine();
    setNextLyrics(nextLine);
    writeCount(0);
    resetLineStatus();

    const enableRetrySKip = startLine.time > 5;

    writeGameUtilRefParams({
      replayKeyCount: 0,
      isRetrySkip: enableRetrySKip,
    });

    const { scene } = readGameUtilityParams();
    if (scene === "play" || scene === "practice") {
      sendTypingStats();
    }

    switch (scene) {
      case "play": {
        const { type: totalTypeCount } = readTypingStatus();
        if (totalTypeCount) {
          const { retryCount } = readGameUtilRefParams();
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
        setTabName("ステータス");

        if (newPlayMode === "play" || newPlayMode === "practice") {
          sendPlayCountStats();
        }
        setNotify(Symbol(""));
        break;
      }
    }

    setScene(newPlayMode);

    if (newPlayMode === "play") {
      initializeLineResults(structuredClone(map.initialLineResultData));
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
    timerControls.stopTimer();
    readPlayer().playVideo();
  };
};
