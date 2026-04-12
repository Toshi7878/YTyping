import { getStartLine } from "@/lib/build-map/built-map-helper";
import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { readMapId } from "../_atoms/hydrate";
import { initializeAllLineResult } from "../_atoms/line-result";
import {
  readTypingStats,
  readUtilityRefParams,
  resetLineCount,
  resetLineSubstatus,
  resetTypingSubstatus,
  writeUtilityRefParams,
} from "../_atoms/ref";
import {
  type PlayMode,
  readBuiltMap,
  readUtilityParams,
  resetReplayRankingResult,
  setNotify,
  setScene,
  setTabName,
} from "../_atoms/state";
import { readTypingStatus, resetAllTypingStatus } from "../_atoms/status";
import { setCombo } from "../_atoms/substatus";
import { resetCurrentLine, setNextLyrics } from "../_atoms/typing-word";
import { playYTPlayer, seekYTPlayer } from "../_atoms/youtube-player";
import { stopTimer } from "../_feature/typing-card/playing/timer/timer";
import { mutateTypingStats } from "./stats";

export const restartPlay = (newPlayMode: PlayMode) => {
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

  if (scene === "play" || scene === "practice") {
    const stats = readTypingStats();
    mutateTypingStats(stats);
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
    resetAllTypingStatus();
    setCombo(0);
    resetTypingSubstatus();
  }

  if (newPlayMode !== "replay") {
    resetReplayRankingResult();
  }

  seekYTPlayer(0);
  stopTimer();
  playYTPlayer();
};
