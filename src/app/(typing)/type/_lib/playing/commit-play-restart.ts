import { getStartLine } from "@/lib/build-map/built-map-helper";
import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { initializeAllLineResult } from "../atoms/family";
import { readMapId } from "../atoms/hydrate";
import {
  readUtilityRefParams,
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
  resetReplayRankingResult,
  resetTypingStatus,
  setCombo,
  setNextLyrics,
  setNotify,
  setScene,
  setTabName,
} from "../atoms/state";
import { playYTPlayer, seekYTPlayer } from "../atoms/yt-player";
import { mutateTypingStats } from "../mutate/stats";
import type { PlayMode } from "../type";
import { stopTimer } from "./timer/timer";

export const commitPlayRestart = (newPlayMode: PlayMode) => {
  const map = readBuiltMap();
  const nextLine = map?.lines[1];
  if (!map || !nextLine) return;
  const startLine = getStartLine(map.lines);
  if (!startLine) return;
  resetCurrentLine();
  setNextLyrics(nextLine);
  resetLineCount();
  resetLineSubstatus();

  const isEnableRetrySkip = startLine.time > 5;

  writeUtilityRefParams({ replayKeyCount: 0, isRetrySkip: isEnableRetrySkip });

  const { scene } = readUtilityParams();
  const { type: totalTypeCount } = readTypingStatus();

  if (totalTypeCount && (scene === "play" || scene === "practice")) {
    mutateTypingStats();
  }

  const mapId = readMapId();

  switch (scene) {
    case "play": {
      if (totalTypeCount) {
        const { retryCount } = readUtilityRefParams();
        writeUtilityRefParams({ retryCount: retryCount + 1 });
        if (totalTypeCount >= 10 && mapId) {
          mutatePlayCountStats({ mapId });
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

      if (mapId && (newPlayMode === "play" || newPlayMode === "practice")) {
        mutatePlayCountStats({ mapId });
      }
      setNotify(Symbol(""));
      break;
    }
  }

  setScene(newPlayMode);

  if (newPlayMode === "play") {
    initializeAllLineResult(structuredClone(map.initialLineResults));
  }

  if (newPlayMode !== "practice") {
    resetTypingStatus();
    setCombo(0);
    resetSubstatus();
  }

  if (newPlayMode !== "replay") {
    resetReplayRankingResult();
  }

  seekYTPlayer(0);
  stopTimer();
  playYTPlayer();
};
