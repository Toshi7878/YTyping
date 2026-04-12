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
} from "@/app/(typing)/type/_atoms/ref";
import {
  type BuiltMap,
  getBuiltMap,
  readMediaSpeed,
  readScene,
  readUtilityParams,
  setActiveSkipGuideKey,
  setChangeCSSCount,
  transitionToEndScene,
} from "@/app/(typing)/type/_atoms/state";
import type { BuiltMapLineWithOption } from "@/lib/types";
import type { YouTubeSpeed } from "@/utils/types";
import { readMapId } from "../../../../_atoms/hydrate";
import { readAllLineResult } from "../../../../_atoms/line-result";
import { setElapsedSecTime, setLineKpm, setLineRemainTime } from "../../../../_atoms/substatus";
import { getTypingWord, setTypingWord } from "../../../../_atoms/typing-word";
import { readYTPlayer, setYTPlaybackRate } from "../../../../_atoms/youtube-player";
import { mutateIncrementMapCompletionPlayCountStats, mutateTypingStats } from "../../../../_lib/stats";
import { calculateLineKpm } from "../../../../_utils/calculate-kpm";
import { setTypingStatus } from "../../../tabs/typing-status/status-cell";
import { getRemainLineTime } from "../../../youtube/get-youtube-time";
import { getTotalProgressMax, setTotalProgressValue } from "../../footer/total-time-progress";
import { getLineProgressMax, setLineProgressMax, setLineProgressValue } from "../../header/line-time-progress";
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
        const { scene } = readUtilityParams();

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
          const newLineKpm = calculateLineKpm({ lineTypeCount, constantLineTime });
          setLineKpm(newLineKpm);
        }

        updateSkipGuideVisibility({
          kana: getTypingWord().nextChunk.kana,
          currentTime,
          constantLineTime,
          constantRemainLineTime,
        });

        setTotalProgressValue(currentTime);
      },

      on1000MsUpdate: ({ constantTime }) => {
        setElapsedSecTime(constantTime);
      },

      onTimeLimitReach: ({ nextCount }) => {
        const typingWord = getTypingWord();
        const isLineCompleted = !!typingWord.correct.roma && !typingWord.nextChunk.kana;
        const scene = readScene();

        if (!isLineCompleted && scene !== "replay") {
          processIncompleteLineEnd({ map, constantLineTime, count });
        }

        setupNextLine(map, scene === "play" ? nextCount : getLineCountByTime(currentTime));
      },

      onTimerEnd: ({ constantLineTime }) => {
        const { scene } = readUtilityParams();
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
  const { scene } = readUtilityParams();

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
  resetLineSubstatus();

  const { inputMode, scene } = readUtilityParams();
  const playSpeed = readMediaSpeed();

  if (scene === "replay") {
    syncReplayLineSnapshot(nextCount);
    recalculateStatusFromResults({ count: nextCount, updateType: "lineUpdate" });
  }
  writeLineSubstatus({ startSpeed: playSpeed, startInputMode: inputMode });
  setTypingStatus((prev) => ({ ...prev, point: 0, timeBonus: 0 }));
  setLineKpm(0);
  setNextLyricsAndKpm(newNextLine);
  setChangeCSSCount(nextCount);
};

const setNewLine = (newLine: BuiltMapLineWithOption) => {
  setTypingWord(createTypingWord(newLine));
  setLyrics(newLine.lyrics);

  setLineProgressValue(0);
  setLineProgressMax(newLine.duration);
};

interface updateSkipGuideVisibilityparams {
  kana: string;
  currentTime: number;
  constantLineTime: number;
  constantRemainLineTime: number;
}

const SKIP_IN = 0.4; //ラインが切り替わり後、指定のtimeが経過したら表示
const SKIP_OUT = 4; //ラインの残り時間が指定のtimeを切ったら非表示
const SKIP_KEY = "Space" as const;
const updateSkipGuideVisibility = ({
  kana,
  currentTime,
  constantLineTime,
  constantRemainLineTime,
}: updateSkipGuideVisibilityparams) => {
  const map = getBuiltMap();
  if (!map) return;
  const { isRetrySkip } = getUtilityRefParams();
  const playSpeed = readMediaSpeed();
  const startLine = map.lines[map.typingLineIndexes[0] ?? 0];

  if (isRetrySkip && startLine && currentTime >= startLine.time - 3 * playSpeed) {
    writeUtilityRefParams({ isRetrySkip: false });
  }

  const IS_SKIP_DISPLAY = (!kana && constantLineTime >= SKIP_IN && constantRemainLineTime >= SKIP_OUT) || isRetrySkip;

  if (IS_SKIP_DISPLAY) {
    setActiveSkipGuideKey(SKIP_KEY);
  } else {
    setActiveSkipGuideKey(null);
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
