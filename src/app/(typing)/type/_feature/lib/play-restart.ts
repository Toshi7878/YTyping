import { atom, type SetStateAction } from "jotai";
import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { type BuiltMap, getBuiltMap } from "../atoms/built-map";
import { initializeAllLineResult } from "../atoms/line-result";
import { resetLineSubstatus } from "../atoms/line-substatus";
import { resetReplayRankingResult } from "../atoms/replay";
import { getTypingStats } from "../atoms/stats";
import { store } from "../atoms/store";
import { resetTypingSubstatus } from "../atoms/substatus";
import { resetTypingWord } from "../atoms/typing-word";
import { playYTPlayer, seekYTPlayer } from "../atoms/youtube-player";
import { getMapId } from "../provider";
import { setTabName } from "../tabs/tabs";
import { getTypingStatus, resetTypingStatus } from "../tabs/typing-status/status-cell";
import { setCombo } from "../typing-card/header/combo";
import { setLineProgressMax, setLineProgressValue } from "../typing-card/header/line-time-progress";
import { setNotify } from "../typing-card/header/notify";
import { setLyrics } from "../typing-card/playing/lyrics";
import { setNextLyricsAndKpm } from "../typing-card/playing/next-lyrics";
import { setLineCount } from "../typing-card/playing/playing-scene";
import { stopTimer } from "../typing-card/playing/timer/timer";
import { getScene, type PlayingSceneType, setScene } from "../typing-card/typing-card";
import { emitRestartPlayUserScript } from "../user-script";
import { mutateTypingStats } from "./stats";

const retryCountAtom = atom(1);
const getRetryCount = () => store.get(retryCountAtom);
const setRetryCount = (updater: SetStateAction<number>) => store.set(retryCountAtom, updater);

export const resetRetryCount = () => store.set(retryCountAtom, 1);

export const restartPlay = (newPlayMode: PlayingSceneType) => {
  const map = getBuiltMap();
  const nextLine = map?.lines[1];
  if (!map || !nextLine) return;
  resetCurrentLine(map);
  setNextLyricsAndKpm(nextLine);
  setLineCount(0);
  resetLineSubstatus();

  const scene = getScene();
  const { type: totalTypeCount } = getTypingStatus();

  if (scene === "play" || scene === "practice") {
    const stats = getTypingStats();
    mutateTypingStats(stats);
  }

  const mapId = getMapId();

  switch (scene) {
    case "play": {
      if (totalTypeCount) {
        setRetryCount((prev) => prev + 1);
        if (totalTypeCount >= 10 && mapId) {
          mutatePlayCountStats({ mapId });
        }
      }

      const retryCount = getRetryCount();
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
  emitRestartPlayUserScript();
};

export const resetCurrentLine = (map: BuiltMap) => {
  resetTypingWord();
  setLyrics("");

  setLineProgressValue(0);
  if (map?.lines[1]) {
    setLineProgressMax(map.lines[1].time);
  }
};
