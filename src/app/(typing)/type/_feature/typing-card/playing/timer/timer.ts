import { Ticker } from "@pixi/ticker";
import { createTypingWord } from "lyrics-typing-engine";
import {
  getUtilityRefParams,
  readLineCount,
  readLineSubstatus,
  readTypingStats,
  resetLineSubstatus,
  writeLineCount,
  writeLineSubstatus,
  writeUtilityRefParams,
} from "@/app/(typing)/type/_feature/atoms/ref";
import {
  type BuiltMap,
  getBuiltMap,
  readMediaSpeed,
  readUtilityParams,
} from "@/app/(typing)/type/_feature/atoms/state";
import type { BuiltMapLineWithOption } from "@/lib/types";
import { countPerMinute } from "@/utils/math";
import type { YouTubeSpeed } from "@/utils/types";
import { readMapId } from "../../../atoms/hydrate";
import { readAllLineResult } from "../../../atoms/line-result";
import { setElapsedSecTime, setLineKpm, setLineRemainTime } from "../../../atoms/substatus";
import { getTypingWord, setTypingWord } from "../../../atoms/typing-word";
import { readYTPlayer, setYTPlaybackRate } from "../../../atoms/youtube-player";
import { mutateIncrementMapCompletionPlayCountStats, mutateTypingStats } from "../../../lib/stats";
import { setTypingStatus } from "../../../tabs/typing-status/status-cell";
import { getRemainLineTime } from "../../../youtube/get-youtube-time";
import { setLineCustomStyleIndex } from "../../custom-style";
import { setActiveSkipKey } from "../../footer/skip";
import { getTotalProgressMax, setTotalProgressValue } from "../../footer/total-time-progress";
import { getLineProgressMax, setLineProgressMax, setLineProgressValue } from "../../header/line-time-progress";
import { getScene, transitionToEndScene } from "../../typing-card";
import { getLineCountByTime } from "../get-line-count-by-time";
import { setLyrics } from "../lyrics";
import { setNextLyricsAndKpm } from "../next-lyrics";
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

const handleTimer = () => {
  const YTPlayer = readYTPlayer();
  const map = getBuiltMap();
  if (!YTPlayer || !map) {
    typeTicker.stop();
    return;
  }

  const { currentTime, constantTime, currentLineTime, constantLineTime, constantRemainLineTime } = getRemainLineTime();
  const count = readLineCount();

  timer(
    {
      currentTime,
      constantTime,
      constantLineTime,
      constantRemainLineTime,
      timeLimitState: { lines: map.lines, currentIndex: count },
      endState: currentTime >= map.duration,
    },
    {
      onUpdate: () => {
        setLineProgressValue(currentLineTime);
        const scene = getScene();

        if (scene === "replay" && count > 0) {
          const lineResults = readAllLineResult();

          const lineResult = lineResults[count];
          if (!lineResult) return;
          const { types } = lineResult;
          if (types.length === 0) return;
          const { replayKeyCount } = getUtilityRefParams();
          const typeResult = types[replayKeyCount];
          if (!typeResult) return;
          const { time: keyTime } = typeResult;
          if (constantLineTime >= keyTime) {
            simulateTypingInput({ constantLineTime, constantRemainLineTime, typeResult });
            writeUtilityRefParams({ replayKeyCount: replayKeyCount + 1 });
          }
        }
      },
      on100MsUpdate: ({ currentTime, constantLineTime, constantRemainLineTime }) => {
        setLineRemainTime(constantRemainLineTime);
        const typingWord = getTypingWord();
        const isLineCompleted = typingWord.correct.roma && !typingWord.nextChunk.kana;

        if (!isLineCompleted) {
          const { typeCount: lineTypeCount } = readLineSubstatus();
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
      },

      on1000MsUpdate: ({ constantTime }) => {
        setElapsedSecTime(constantTime);
      },

      onTimeLimitReach: ({ nextCount }) => {
        const typingWord = getTypingWord();
        const isLineCompleted = !!typingWord.correct.roma && !typingWord.nextChunk.kana;
        const scene = getScene();

        if (!isLineCompleted && scene !== "replay") {
          processIncompleteLineEnd({ map, constantLineTime, count });
        }

        setupNextLine(map, scene === "play" ? nextCount : getLineCountByTime(currentTime));
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
          const stats = readTypingStats();
          mutateTypingStats(stats);
          const mapId = readMapId();
          if (!mapId) return;
          mutateIncrementMapCompletionPlayCountStats({ mapId });
        } else if (scene === "practice") {
          const stats = readTypingStats();
          mutateTypingStats(stats);
        }
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
    saveLineResult(count);
  }

  switch (scene) {
    case "play":
    case "play_end":
      updateStatusForLineUpdate({ constantLineTime });
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

  writeLineCount(nextCount);
  setNewLine(newLine);
  setNextLyricsAndKpm(newNextLine);
  resetLineSubstatus();

  const { inputMode } = readUtilityParams();
  const scene = getScene();
  const playSpeed = readMediaSpeed();

  if (scene === "replay") {
    syncReplayLineSnapshot(nextCount);
    recalculateStatusFromResults({ count: nextCount, updateType: "lineUpdate" });
  }
  writeLineSubstatus({ startSpeed: playSpeed, startInputMode: inputMode });
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

  const playSpeed = readMediaSpeed();
  const skipOutTime = startLine.time - 3 * playSpeed;

  if (startLine.time > 5 && skipOutTime > currentTime) {
    setActiveSkipKey(SKIP_KEY);
  } else {
    setActiveSkipKey(null);
  }
};

const syncReplayLineSnapshot = (newCurrentCount: number) => {
  const lineResults = readAllLineResult();
  const { inputMode } = readUtilityParams();

  const lineResult = lineResults[newCurrentCount];

  if (!lineResult) {
    return;
  }

  const newInputMode = lineResult.status.mode;

  if (inputMode !== newInputMode) {
    if (newInputMode === "roma") {
      applyRomaInputMode();
    } else {
      applyKanaInputMode();
    }
  }

  writeUtilityRefParams({ replayKeyCount: 0 });

  const playSpeed = readMediaSpeed();
  const speed = lineResult.status.speed as YouTubeSpeed;

  if (playSpeed === speed) return;
  setYTPlaybackRate(speed);
};

const typeTicker = new Ticker();
typeTicker.add(handleTimer);
