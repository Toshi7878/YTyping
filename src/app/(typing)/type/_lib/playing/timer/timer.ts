import { Ticker } from "@pixi/ticker";
import {
  readLineCount,
  readLineSubstatus,
  readUtilityRefParams,
  readYTPlayer,
  resetLineSubstatus,
  setLineProgressValue,
  setTotalProgressValue,
  writeLineCount,
  writeLineSubstatus,
  writeUtilityRefParams,
} from "@/app/(typing)/type/_lib/atoms/ref";
import { handlePlaySpeedAction, readPlaySpeed } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import {
  readBuiltMap,
  readElapsedSecTime,
  readLineWord,
  readUtilityParams,
  setActiveSkipGuideKey,
  setChangeCSSCount,
  setElapsedSecTime,
  setLineKpm,
  setLineRemainTime,
  setNewLine,
  setNextLyrics,
  setTypingStatus,
} from "@/app/(typing)/type/_lib/atoms/state";
import type { YouTubeSpeed } from "@/utils/types";
import { readAllLineResult } from "../../atoms/family";
import type { BuiltMapLine } from "../../type";
import { getRemainLineTime } from "../../youtube-player/get-youtube-time";
import { onEnd } from "../../youtube-player/youtube-events";
import { calcTypeSpeed } from "../calc-type-speed";
import { getLineCountByTime } from "../get-line-count-by-time";
import { applyKanaInputMode, applyRomaInputMode } from "../input-mode-change";
import { hasLineResultImproved, saveLineResult } from "../save-line-result";
import { updateStatusForLineUpdate } from "../update-status/line-update";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { processReplayKeyAtTimestamp } from "./replay-processor";

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

export const setTimerFPS = (rate: number) => {
  typeTicker.maxFPS = rate;
  typeTicker.minFPS = rate;
};
let lastUpdateTime = 0;

const timer = () => {
  const map = readBuiltMap();
  if (!map) return;

  const { currentTime, constantTime, currentLineTime, constantLineTime, constantRemainLineTime } = getRemainLineTime();
  const { movieDuration } = readUtilityParams();

  const count = readLineCount();
  const nextLine = map.mapData[count + 1];
  const nextLineTime = nextLine && movieDuration > nextLine.time ? nextLine.time : movieDuration;

  const hasReachedNextLineTime = currentTime >= nextLineTime;
  const YTPlayer = readYTPlayer();
  const isVideoEnded = YTPlayer?.getPlayerState() === YT.PlayerState.ENDED;
  if (hasReachedNextLineTime || isVideoEnded) {
    proceedToNextLine({ currentTime, constantLineTime, nextLine, prevCount: count, isVideoEnded });
    return;
  }

  const shouldUpdate100ms = Math.abs(constantTime - lastUpdateTime) >= 0.1;
  if (shouldUpdate100ms) {
    updateEvery100ms({ currentTime, constantTime, constantLineTime, constantRemainLineTime });
    lastUpdateTime = constantTime;
  }

  setLineProgressValue(currentLineTime);
  const { scene } = readUtilityParams();

  if (scene === "replay") {
    processReplayKeyAtTimestamp({ constantLineTime, constantRemainLineTime });
  }
};

const proceedToNextLine = ({
  currentTime,
  constantLineTime,
  nextLine,
  prevCount,
  isVideoEnded,
}: {
  currentTime: number;
  constantLineTime: number;
  nextLine: BuiltMapLine | undefined;
  prevCount: number;
  isVideoEnded: boolean;
}) => {
  const { scene, movieDuration } = readUtilityParams();
  const { isCompleted } = readLineSubstatus();

  if (!isCompleted && scene !== "replay") {
    processIncompleteLineEnd({ constantLineTime, count: prevCount });
  }

  const isEnd = nextLine?.lyrics === "end" || currentTime >= movieDuration || isVideoEnded;

  if (isEnd) {
    onEnd();
    stopTimer();
    const YTPlayer = readYTPlayer();
    YTPlayer?.stopVideo();
    YTPlayer?.cueVideoById(YTPlayer.getVideoData().video_id);
    return;
  }

  if (nextLine) {
    const nextCount = scene === "play" ? prevCount + 1 : getLineCountByTime(currentTime);
    setupLine(nextCount);
  }
};

const updateEvery100ms = ({
  currentTime,
  constantLineTime,
  constantRemainLineTime,
  constantTime,
}: {
  currentTime: number;
  constantTime: number;
  constantLineTime: number;
  constantRemainLineTime: number;
}) => {
  setLineRemainTime(constantRemainLineTime);

  const { isCompleted } = readLineSubstatus();

  if (!isCompleted) {
    calcTypeSpeed({ updateType: "timer", constantLineTime });
  }

  updateSkipGuideVisibility({
    kana: readLineWord().nextChar.k,
    currentTime,
    constantLineTime,
    constantRemainLineTime,
  });

  setTotalProgressValue(currentTime);
  const elapsedSecTime = readElapsedSecTime();
  if (Math.abs(constantTime - elapsedSecTime) >= 1) {
    setElapsedSecTime(constantTime);
  }
};

const processIncompleteLineEnd = ({ constantLineTime, count }: { constantLineTime: number; count: number }) => {
  const map = readBuiltMap();
  const currentLine = map?.mapData[count];
  if (!map || !currentLine) return;

  const isTypingLine = count >= 0 && currentLine.kpm.r > 0;
  const { scene } = readUtilityParams();

  if (isTypingLine) {
    calcTypeSpeed({ updateType: "lineUpdate", constantLineTime });
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
      recalculateStatusFromResults({ count: map.mapData.length - 1, updateType: "lineUpdate" });
      break;
  }
};

export const setupLine = (nextCount: number) => {
  const map = readBuiltMap();
  const newCurrentLine = map?.mapData[nextCount];
  const newNextLine = map?.mapData[nextCount + 1];
  if (!map || !newCurrentLine || !newNextLine) return;

  writeLineCount(nextCount);
  setNewLine({ newCurrentLine, newNextLine });
  resetLineSubstatus();

  const { inputMode, scene } = readUtilityParams();
  const { playSpeed } = readPlaySpeed();

  if (scene === "replay") {
    syncReplayLineSnapshot(nextCount);
    recalculateStatusFromResults({ count: nextCount, updateType: "lineUpdate" });
  }

  writeLineSubstatus({ startSpeed: playSpeed, startInputMode: inputMode });
  setTypingStatus((prev) => ({ ...prev, point: 0, timeBonus: 0 }));
  setLineKpm(0);

  setNextLyrics(newNextLine);

  setChangeCSSCount(nextCount);
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
  const map = readBuiltMap();
  if (!map) return;
  const { isRetrySkip } = readUtilityRefParams();
  const { playSpeed } = readPlaySpeed();
  const startLine = map.mapData[map.startLine];

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

  const { playSpeed } = readPlaySpeed();
  const speed = lineResult.status.sp as YouTubeSpeed;

  if (playSpeed === speed) return;
  handlePlaySpeedAction({ type: "set", payload: speed });
};

const typeTicker = new Ticker();
typeTicker.add(timer);
