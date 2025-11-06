import { initializeAllLineResult } from "../atoms/family";
import {
  readUtilityRefParams,
  readYTPlayer,
  resetLineCount,
  resetLineSubstatus,
  resetSubstatus,
  writeUtilityRefParams,
} from "../atoms/ref";
import {
  readBuiltMap,
  readTypingStatus,
  readUtilityParams,
  resetCurrentLine,
  resetTypingStatus,
  setCombo,
  setNextLyrics,
  setNotify,
  setReplayUserName,
  setScene,
  setTabName,
} from "../atoms/state";
import type { PlayMode } from "../type";
import { mutatePlayCountStats, mutateTypingStats } from "./mutate-stats";
import { stopTimer } from "./timer/timer";

export const commitPlayRestart = (newPlayMode: PlayMode) => {
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
    mutateTypingStats();
  }

  switch (scene) {
    case "play": {
      const { type: totalTypeCount } = readTypingStatus();
      if (totalTypeCount) {
        const { retryCount } = readUtilityRefParams();
        writeUtilityRefParams({ retryCount: retryCount + 1 });
        if (totalTypeCount >= 10) {
          mutatePlayCountStats();
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
        mutatePlayCountStats();
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
    setReplayUserName(null);
  }

  const YTPlayer = readYTPlayer();
  if (!YTPlayer) return;

  YTPlayer.seekTo(0, true);
  stopTimer();
  YTPlayer.playVideo();
};
