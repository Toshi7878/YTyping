import {
  readUtilityRefParams,
  readYTPlayer,
  resetLineCount,
  resetLineSubstatus,
  resetSubstatus,
  writeUtilityRefParams,
} from "../atoms/read-atoms";
import {
  initializeAllLineResult,
  readBuiltMap,
  readTypingStatus,
  readUtilityParams,
  resetCurrentLine,
  resetTypingStatus,
  setCombo,
  setNextLyrics,
  setNotify,
  setScene,
  setTabName,
} from "../atoms/state-atoms";
import type { PlayMode } from "../type";
import { timerControls } from "./timer/use-timer";
import { useSendUserStats } from "./use-send-user-stats";

export const useRetry = () => {
  const { sendPlayCountStats, sendTypingStats } = useSendUserStats();

  return (newPlayMode: PlayMode) => {
    const map = readBuiltMap();
    const nextLine = map?.mapData[1];
    const startLine = map?.mapData[map.startLine];
    if (!nextLine || !startLine) return;
    resetCurrentLine();
    setNextLyrics(nextLine);
    resetLineCount();
    resetLineSubstatus();

    const enableRetrySKip = startLine.time > 5;

    writeUtilityRefParams({ replayKeyCount: 0, isRetrySkip: enableRetrySKip });

    const { scene } = readUtilityParams();
    if (scene === "play" || scene === "practice") {
      sendTypingStats();
    }

    switch (scene) {
      case "play": {
        const { type: totalTypeCount } = readTypingStatus();
        if (totalTypeCount) {
          const { retryCount } = readUtilityRefParams();
          writeUtilityRefParams({ retryCount: retryCount + 1 });
          if (totalTypeCount >= 10) {
            sendPlayCountStats();
          }
        }

        const { retryCount } = readUtilityRefParams();
        setNotify(Symbol(`Retry(${retryCount})`));
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
      initializeAllLineResult(structuredClone(map.initialLineResultData));
    }

    if (newPlayMode !== "practice") {
      resetTypingStatus();
      setCombo(0);
      resetSubstatus();
    }

    if (newPlayMode !== "replay") {
      writeUtilityRefParams({ replayUserName: "" });
    }

    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;

    YTPlayer.seekTo(0, true);
    timerControls.stopTimer();
    YTPlayer.playVideo();
  };
};
