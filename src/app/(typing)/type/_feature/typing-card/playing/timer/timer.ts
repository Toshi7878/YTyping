import { Ticker } from "@pixi/ticker";
import { createTypingWord } from "lyrics-typing-engine";
import YouTube from "react-youtube";
import { type BuiltMap, getBuiltMap } from "@/app/(typing)/type/_feature/atoms/built-map";
import {
  getLineSubstatus,
  resetLineSubstatus,
  setLineSubstatus,
} from "@/app/(typing)/type/_feature/atoms/line-substatus";
import type { BuiltMapLineWithOption } from "@/shared/map/built-map-helper";
import { countPerMinute } from "@/utils/math";
import { getLineResultByIndex } from "../../../atoms/line-results";
import { getTypingStats } from "../../../atoms/stats";
import { getPlayingInputMode, getTypingWord, setTypingWord } from "../../../atoms/typing-word";
import { getYTPlayer, setYTPlaybackRate } from "../../../atoms/youtube-player";
import { mutateIncrementMapCompletionPlayCountStats, mutateTypingStats } from "../../../lib/stats";
import { getMapId } from "../../../provider";
import { setTypingStatus } from "../../../tabs/typing-status/status-cell";
import { dispatchTypeEvent } from "../../../user-script";
import { getRemainLineTime } from "../../../youtube/get-youtube-time";
import { getMediaSpeed } from "../../../youtube/youtube-player";
import { setLineCustomStyleIndex } from "../../custom-style";
import { setElapsedSecTime } from "../../footer/playback-time";
import { setActiveSkipKey } from "../../footer/skip";
import { getTotalProgressMax, setTotalProgressValue } from "../../footer/total-time-progress";
import { setLineKpm } from "../../header/line-kpm";
import { getLineProgressMax, setLineProgressMax, setLineProgressValue } from "../../header/line-time-progress";
import { setLineRemainTime } from "../../header/remain-time";
import { getScene, transitionToEndScene } from "../../typing-card";
import { getLineCountByTime } from "../get-line-count-by-time";
import { setLyrics } from "../lyrics";
import { setNextLyricsAndKpm } from "../next-lyrics";
import { getLineCount, setLineCount } from "../playing-scene";
import { hasLineResultImproved, saveLineResult } from "../save-line-result";
import { applyKanaInputMode, applyRomaInputMode } from "../toggle-input-mode";
import { updateStatusForLineUpdate } from "../update-status/line-update";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { updateTypingTime } from "../update-status/update-kpm";
import { simulateTypingInput } from "./replay";

export const startTimer = () => {
  if (!typeTicker.started) {
    typeTicker.start();
  }
};

export const stopTimer = () => {
  if (typeTicker.started) {
    typeTicker.stop();
  }
};

export const setTimerMaxFPS = (rate: number) => {
  typeTicker.maxFPS = rate;
};

let replayKeyCount = 0;
const handleTimer = () => {
  const YTPlayer = getYTPlayer();
  const map = getBuiltMap();
  if (!YTPlayer || !map) {
    typeTicker.stop();
    return;
  }

  const { currentTime, constantTime, currentLineTime, constantLineTime, constantRemainLineTime } = getRemainLineTime();
  const count = getLineCount();

  timer(
    {
      currentTime,
      constantTime,
      constantLineTime,
      constantRemainLineTime,
      timeLimitState: { lines: map.lines, currentIndex: count },
      endState: currentTime >= map.duration || YTPlayer.getPlayerState() === YouTube.PlayerState.ENDED,
    },
    {
      onUpdate: () => {
        setLineProgressValue(currentLineTime);
        const scene = getScene();

        dispatchTypeEvent("timer:tick", { currentTime, constantLineTime, constantRemainLineTime });
        if (scene === "replay" && count > 0) {
          const lineResult = getLineResultByIndex(count);
          if (!lineResult) return;
          const { types } = lineResult;
          if (types.length === 0) return;
          const typeResult = types[replayKeyCount];
          if (!typeResult) return;
          const { time: keyTime } = typeResult;
          if (constantLineTime >= keyTime) {
            simulateTypingInput({ constantLineTime, constantRemainLineTime, typeResult });
            replayKeyCount++;
          }
        }
      },
      on100MsUpdate: ({ currentTime, constantTime, constantLineTime, constantRemainLineTime }) => {
        setLineRemainTime(constantRemainLineTime);
        const typingWord = getTypingWord();
        const isLineCompleted = typingWord.correct.roma && !typingWord.nextChunk.kana;

        if (!isLineCompleted) {
          const { typeCount: lineTypeCount } = getLineSubstatus();
          const newLineKpm = countPerMinute(lineTypeCount, constantLineTime);
          setLineKpm(newLineKpm);
        }

        const startCount = map.typingLineIndexes[0] ?? 0;

        if (startCount > count) {
          firstUpdateSkipGuideVisibility({ currentTime, startCount });
        } else {
          updateSkipGuideVisibility({
            isNotTypingLine: !getTypingWord().nextChunk.kana,
            constantLineTime,
            constantRemainLineTime,
          });
        }

        setTotalProgressValue(currentTime);
        dispatchTypeEvent("timer:100msUpdate", { currentTime, constantTime, constantLineTime, constantRemainLineTime });
      },

      on1000MsUpdate: ({ constantTime }) => {
        setElapsedSecTime(constantTime);
        dispatchTypeEvent("timer:1sUpdate", { constantTime });
      },

      onTimeLimitReach: ({ nextCount }) => {
        const typingWord = getTypingWord();
        const isLineCompleted = !!typingWord.correct.roma && !typingWord.nextChunk.kana;
        const scene = getScene();

        if (!isLineCompleted && scene !== "replay") {
          processIncompleteLineEnd({ map, constantLineTime, count });
        }

        setupNextLine(map, scene === "play" ? nextCount : getLineCountByTime(currentTime));
        dispatchTypeEvent("timer:lineChange", { nextCount });
      },

      onTimerEnd: ({ constantLineTime }) => {
        const scene = getScene();
        const typingWord = getTypingWord();
        const isLineCompleted = !!typingWord.correct.roma && !typingWord.nextChunk.kana;

        if (!isLineCompleted && scene !== "replay") {
          processIncompleteLineEnd({ map, constantLineTime, count });
        }

        setTypingStatus((prev) => ({ ...prev, point: 0, timeBonus: 0 }));
        setLineKpm(0);
        transitionToEndScene(scene);
        stopTimer();

        setLineProgressValue(getLineProgressMax());
        setTotalProgressValue(getTotalProgressMax());

        if (scene === "play") {
          const stats = getTypingStats();
          mutateTypingStats(stats);
          const mapId = getMapId();
          if (!mapId) return;
          mutateIncrementMapCompletionPlayCountStats({ mapId });
        } else if (scene === "practice") {
          const stats = getTypingStats();
          mutateTypingStats(stats);
        }
        dispatchTypeEvent("timer:end", { constantLineTime });
      },
    },
  );
};

let last100MsUpdateTime = 0;
let last1000MsUpdateTime = 0;

const timer = <T extends { time: number }>(
  {
    currentTime,
    constantTime,
    constantLineTime,
    constantRemainLineTime,
    timeLimitState,
    endState,
  }: {
    currentTime: number;
    constantTime: number;
    constantLineTime: number;
    constantRemainLineTime: number;
    timeLimitState: { lines: T[]; currentIndex: number };
    endState: boolean;
  },
  {
    onUpdate,
    on100MsUpdate,
    on1000MsUpdate,
    onTimeLimitReach,
    onTimerEnd,
  }: {
    onUpdate: () => void;
    on100MsUpdate: ({
      currentTime,
      constantTime,
      constantLineTime,
      constantRemainLineTime,
    }: {
      currentTime: number;
      constantTime: number;
      constantLineTime: number;
      constantRemainLineTime: number;
    }) => void;
    on1000MsUpdate: ({ constantTime }: { constantTime: number }) => void;
    onTimeLimitReach: ({ nextCount }: { nextCount: number }) => void;
    onTimerEnd: ({ constantLineTime }: { constantLineTime: number }) => void;
  },
) => {
  const { lines, currentIndex } = timeLimitState;
  const nextLine = lines[currentIndex + 1];
  if (!nextLine || endState) {
    onTimerEnd({ constantLineTime });
    return;
  }
  if (currentTime >= nextLine.time) {
    onTimeLimitReach({ nextCount: currentIndex + 1 });
    return;
  }
  onUpdate();

  const shouldUpdate100ms = Math.abs(constantTime - last100MsUpdateTime) >= 0.1;
  if (shouldUpdate100ms) {
    on100MsUpdate({ currentTime, constantTime, constantLineTime, constantRemainLineTime });

    const shouldUpdate1000ms = Math.abs(constantTime - last1000MsUpdateTime) >= 1;
    if (shouldUpdate1000ms) {
      on1000MsUpdate({ constantTime });
      last1000MsUpdateTime = constantTime;
    }
    last100MsUpdateTime = constantTime;
  }
};

const processIncompleteLineEnd = ({
  map,
  constantLineTime,
  count,
}: {
  map: BuiltMap;
  constantLineTime: number;
  count: number;
}) => {
  const currentLine = map?.lines[count];
  if (!currentLine) return;

  const isTypingLine = count >= 0 && currentLine.kpm.roma > 0;
  const scene = getScene();

  if (isTypingLine) {
    updateTypingTime({ constantLineTime });
  }

  if (hasLineResultImproved(count)) {
    saveLineResult(count, constantLineTime);
  }

  switch (scene) {
    case "play":
    case "play_end":
      updateStatusForLineUpdate();
      break;
    case "practice":
      recalculateStatusFromResults({ count: map.lines.length - 1, updateType: "lineUpdate" });
      break;
  }
};

export const setupNextLine = (map: NonNullable<BuiltMap>, nextCount: number) => {
  const newLine = map?.lines[nextCount];
  const newNextLine = map?.lines[nextCount + 1];
  if (!newLine || !newNextLine) return;

  setLineCount(nextCount);
  setNewLine(newLine);
  setNextLyricsAndKpm(newNextLine);
  resetLineSubstatus();

  const inputMode = getPlayingInputMode();
  const scene = getScene();
  const playSpeed = getMediaSpeed();

  if (scene === "replay") {
    syncReplayLineSnapshot(nextCount);
    recalculateStatusFromResults({ count: nextCount, updateType: "lineUpdate" });
  }
  setLineSubstatus({ startSpeed: playSpeed, startInputMode: inputMode });
  setTypingStatus((prev) => ({ ...prev, point: 0, timeBonus: 0 }));
  setLineKpm(0);
  setLineCustomStyleIndex(nextCount);
};

const setNewLine = (newLine: BuiltMapLineWithOption) => {
  setTypingWord(createTypingWord(newLine));
  setLyrics(newLine.lyrics);

  setLineProgressValue(0);
  setLineProgressMax(newLine.duration);
};

interface updateSkipGuideVisibilityparams {
  isNotTypingLine: boolean;
  constantLineTime: number;
  constantRemainLineTime: number;
}

const SKIP_IN = 0.4;
const SKIP_OUT = 4;
const SKIP_KEY = "Space" as const;
const updateSkipGuideVisibility = ({
  isNotTypingLine,
  constantLineTime,
  constantRemainLineTime,
}: updateSkipGuideVisibilityparams) => {
  const isSkipGuideVisible = isNotTypingLine && constantLineTime >= SKIP_IN && constantRemainLineTime >= SKIP_OUT;

  if (isSkipGuideVisible) {
    setActiveSkipKey(SKIP_KEY);
  } else {
    setActiveSkipKey(null);
  }
};

const firstUpdateSkipGuideVisibility = ({ currentTime, startCount }: { currentTime: number; startCount: number }) => {
  const map = getBuiltMap();
  const startLine = map?.lines[startCount];
  if (!startLine) return;

  const playSpeed = getMediaSpeed();
  const skipOutTime = startLine.time - 3 * playSpeed;

  if (startLine.time > 3 && skipOutTime > currentTime) {
    setActiveSkipKey(SKIP_KEY);
  } else {
    setActiveSkipKey(null);
  }
};

type YouTubeSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

const syncReplayLineSnapshot = (newCurrentCount: number) => {
  const lineResult = getLineResultByIndex(newCurrentCount);
  if (!lineResult) return;
  const newInputMode = lineResult.status.mode;
  const inputMode = getPlayingInputMode();

  if (inputMode !== newInputMode) {
    if (newInputMode === "roma") {
      applyRomaInputMode();
    } else {
      applyKanaInputMode();
    }
  }

  replayKeyCount = 0;
  const playSpeed = getMediaSpeed();
  const speed = lineResult.status.speed as YouTubeSpeed;

  if (playSpeed === speed) return;
  setYTPlaybackRate(speed);
};

const typeTicker = new Ticker();
typeTicker.add(handleTimer);
