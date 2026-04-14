import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { readMapId } from "../_atoms/hydrate";
import { initializeAllLineResult } from "../_atoms/line-result";
import {
  getUtilityRefParams,
  readTypingStats,
  resetLineCount,
  resetLineSubstatus,
  resetTypingSubstatus,
  writeUtilityRefParams,
} from "../_atoms/ref";
import {
  type BuiltMap,
  getBuiltMap,
  type PlayMode,
  readUtilityParams,
  resetReplayRankingResult,
  setNotify,
  setScene,
  setTabName,
} from "../_atoms/state";
import { setCombo } from "../_atoms/substatus";
import { resetTypingWord } from "../_atoms/typing-word";
import { playYTPlayer, seekYTPlayer } from "../_atoms/youtube-player";
import { getTypingStatus, resetTypingStatus } from "../_feature/tabs/typing-status/status-cell";
import { setLineProgressMax, setLineProgressValue } from "../_feature/typing-card/header/line-time-progress";
import { setLyrics } from "../_feature/typing-card/playing/lyrics";
import { setNextLyricsAndKpm } from "../_feature/typing-card/playing/next-lyrics";
import { stopTimer } from "../_feature/typing-card/playing/timer/timer";
import { mutateTypingStats } from "./stats";

export const restartPlay = (newPlayMode: PlayMode) => {
  const map = getBuiltMap();
  const nextLine = map?.lines[1];
  if (!map || !nextLine) return;
  resetCurrentLine(map);
  setNextLyricsAndKpm(nextLine);
  resetLineCount();
  resetLineSubstatus();

  writeUtilityRefParams({ replayKeyCount: 0 });

  const { scene } = readUtilityParams();
  const { type: totalTypeCount } = getTypingStatus();

  if (scene === "play" || scene === "practice") {
    const stats = readTypingStats();
    mutateTypingStats(stats);
  }

  const mapId = readMapId();

  switch (scene) {
    case "play": {
      if (totalTypeCount) {
        const { retryCount } = getUtilityRefParams();
        writeUtilityRefParams({ retryCount: retryCount + 1 });
        if (totalTypeCount >= 10 && mapId) {
          mutatePlayCountStats({ mapId });
        }
      }

      const { retryCount } = getUtilityRefParams();
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
    resetTypingSubstatus();
  }

  if (newPlayMode !== "replay") {
    resetReplayRankingResult();
  }

  seekYTPlayer(0);
  stopTimer();
  playYTPlayer();
};

export const resetCurrentLine = (map: BuiltMap) => {
  resetTypingWord();
  setLyrics("");

  setLineProgressValue(0);
  if (map?.lines[1]) {
    setLineProgressMax(map.lines[1].time);
  }
};
