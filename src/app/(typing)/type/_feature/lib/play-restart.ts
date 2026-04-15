import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { readMapId } from "../atoms/hydrate";
import { initializeAllLineResult } from "../atoms/line-result";
import {
  getUtilityRefParams,
  readTypingStats,
  resetLineCount,
  resetLineSubstatus,
  resetTypingSubstatus,
  writeUtilityRefParams,
} from "../atoms/ref";
import { type BuiltMap, getBuiltMap, resetReplayRankingResult, setNotify } from "../atoms/state";
import { setCombo } from "../atoms/substatus";
import { resetTypingWord } from "../atoms/typing-word";
import { playYTPlayer, seekYTPlayer } from "../atoms/youtube-player";
import { setTabName } from "../tabs/tabs";
import { getTypingStatus, resetTypingStatus } from "../tabs/typing-status/status-cell";
import { setLineProgressMax, setLineProgressValue } from "../typing-card/header/line-time-progress";
import { setLyrics } from "../typing-card/playing/lyrics";
import { setNextLyricsAndKpm } from "../typing-card/playing/next-lyrics";
import { stopTimer } from "../typing-card/playing/timer/timer";
import { getScene, type PlayingSceneType, setScene } from "../typing-card/typing-card";
import { mutateTypingStats } from "./stats";

export const restartPlay = (newPlayMode: PlayingSceneType) => {
  const map = getBuiltMap();
  const nextLine = map?.lines[1];
  if (!map || !nextLine) return;
  resetCurrentLine(map);
  setNextLyricsAndKpm(nextLine);
  resetLineCount();
  resetLineSubstatus();

  writeUtilityRefParams({ replayKeyCount: 0 });

  const scene = getScene();
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
