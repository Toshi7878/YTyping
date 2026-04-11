import { readLineCount, readLineProgress, readPracticeLineItems, writeLineCount } from "../atoms/ref";
import { readBuiltMap, readMediaSpeed, readUtilityParams, setLineSelectIndex, setNotify } from "../atoms/state";
import { seekYTPlayer } from "../atoms/youtube-player";
import { getLineCountByTime } from "./get-line-count-by-time";
import { setupNextLine, stopTimer } from "./timer/timer";

const SEEK_BUFFER_TIME = 0.8;

export const movePrevLine = () => {
  const map = readBuiltMap();
  if (!map) return;

  const { scene, isPaused } = readUtilityParams();
  const isPracticeScene = scene === "practice";
  const isTimeBuffer = isPracticeScene && !isPaused;

  const count = readLineCount();
  const referenceCount = count + 1 - (isTimeBuffer ? 0 : 1);

  const { typingLineIndexes } = map;

  const prevCount = typingLineIndexes.findLast((candidate) => candidate < referenceCount);

  if (prevCount === undefined) return;

  const playSpeed = readMediaSpeed();

  const timeIndex = prevCount + (isTimeBuffer ? 0 : 1);
  const prevTimeRaw = Number(map.lines[timeIndex]?.time);
  const prevTime = prevTimeRaw - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

  const newLineSelectIndex = typingLineIndexes.indexOf(prevCount) + 1;
  setLineSelectIndex(newLineSelectIndex);
  stopTimer();

  const newCount = getLineCountByTime(prevTime);
  writeLineCount(newCount);
  setupNextLine(map, newCount);

  const seekTargetTime = isTimeBuffer ? prevTime : (map.lines[prevCount]?.time ?? 0);
  seekYTPlayer(seekTargetTime);
  setNotify(Symbol("◁"));
  scrollToTable(newLineSelectIndex);
  const newLine = map.lines[newCount];
  const lineProgress = readLineProgress();
  if (lineProgress) {
    lineProgress.value = isTimeBuffer ? prevTime - (newLine?.time ?? 0) : 0;
  }
};

export const moveNextLine = () => {
  const map = readBuiltMap();
  if (!map) return;
  const { lineSelectIndex } = readUtilityParams();
  const count = readLineCount();
  const seekCount = lineSelectIndex ? map.typingLineIndexes[lineSelectIndex - 1] : null;

  const isTypingLine = map.typingLineIndexes.some((num) => num === count);
  const seekCountAdjust = (seekCount && seekCount === count) || (!isTypingLine && seekCount !== count + 1) ? -1 : 0;

  const adjustedCount = count + 1 + seekCountAdjust;

  const nextCount = map.typingLineIndexes.find((num) => num > adjustedCount);
  if (nextCount === undefined) return;
  const prevLine = map.lines[nextCount - 1];
  const nextLine = map.lines[nextCount];
  if (!prevLine || !nextLine) return;
  const playSpeed = readMediaSpeed();
  const { scene, isPaused } = readUtilityParams();
  const prevLineTime = (nextLine.time - prevLine.time) / playSpeed;
  const isTimeBuffer = scene === "practice" && !isPaused && prevLineTime > 1;

  const nextTime = Number(nextLine.time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);
  const newLineSelectIndex = map.typingLineIndexes.indexOf(nextCount) + 1;

  setLineSelectIndex(newLineSelectIndex);
  stopTimer();

  const newCount = getLineCountByTime(nextTime) + (isTimeBuffer ? 0 : 1);
  writeLineCount(newCount);
  setupNextLine(map, newCount);

  seekYTPlayer(nextTime);
  setNotify(Symbol("▷"));
  scrollToTable(newLineSelectIndex);
  const lineProgress = readLineProgress();
  if (lineProgress) {
    lineProgress.value = nextTime - (map.lines[newCount]?.time ?? 0);
  }
};

export const moveSetLine = (seekCount: number) => {
  const map = readBuiltMap();
  if (!map) return;
  const playSpeed = readMediaSpeed();
  const { scene, isPaused } = readUtilityParams();
  const isTimeBuffer = scene === "practice" && !isPaused;
  const seekTime = Number(map.lines[seekCount]?.time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

  seekYTPlayer(seekTime);
  const newCount = getLineCountByTime(seekTime) + (isTimeBuffer ? 0 : 1);
  writeLineCount(newCount);
  setupNextLine(map, newCount);
  stopTimer();

  const lineProgress = readLineProgress();
  if (lineProgress) {
    lineProgress.value = seekTime - (map.lines[newCount]?.time ?? 0);
  }
};

const scrollToTable = (newIndex: number) => {
  const resultCards = readPracticeLineItems();
  const card = resultCards[newIndex];

  if (card) {
    const viewport = card.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
    if (!viewport) return;

    const cardRect = card.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const scrollPosition =
      viewport.scrollTop + cardRect.top - viewportRect.top - viewportRect.height / 2 + card.clientHeight / 2;

    viewport.scrollTo({ top: Math.max(0, scrollPosition), behavior: "instant" });
  }
};
