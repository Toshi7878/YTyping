import { getBuiltMap } from "../../atoms/built-map";
import { getSelectLineIndex, setSelectLineIndex } from "../../atoms/line-results";
import { seekYTPlayer } from "../../atoms/youtube-player";
import { getIsPaused, getMediaSpeed } from "../../youtube/youtube-player";
import { setLineProgressValue } from "../header/line-time-progress";
import { setNotify } from "../header/notify";
import { getScene } from "../typing-card";
import { getLineCountByTime } from "./get-line-count-by-time";
import { getPracticeLineElements } from "./line-practice/line-practice-sheet";
import { getLineCount, setLineCount } from "./playing-scene";
import { setupNextLine, stopTimer } from "./timer/timer";

const SEEK_BUFFER_TIME = 0.8;

export const movePrevLine = () => {
  const map = getBuiltMap();
  if (!map) return;

  const isPaused = getIsPaused();
  const scene = getScene();
  const isPracticeScene = scene === "practice";
  const isTimeBuffer = isPracticeScene && !isPaused;

  const count = getLineCount();
  const referenceCount = count + 1 - (isTimeBuffer ? 0 : 1);

  const { typingLineIndexes } = map;

  const prevCount = typingLineIndexes.findLast((candidate) => candidate < referenceCount);

  if (prevCount === undefined) return;

  const playSpeed = getMediaSpeed();

  const timeIndex = prevCount + (isTimeBuffer ? 0 : 1);
  const prevTimeRaw = Number(map.lines[timeIndex]?.time);
  const prevTime = prevTimeRaw - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

  const newSelectLineIndex = typingLineIndexes.indexOf(prevCount) + 1;
  setSelectLineIndex(newSelectLineIndex);
  stopTimer();

  const newCount = getLineCountByTime(prevTime);
  setLineCount(newCount);
  setupNextLine(map, newCount);

  const seekTargetTime = isTimeBuffer ? prevTime : (map.lines[prevCount]?.time ?? 0);
  seekYTPlayer(seekTargetTime);
  setNotify(Symbol("◁"));
  scrollToTable(newSelectLineIndex);
  const newLine = map.lines[newCount];

  setLineProgressValue(isTimeBuffer ? prevTime - (newLine?.time ?? 0) : 0);
};

export const moveNextLine = () => {
  const map = getBuiltMap();
  if (!map) return;
  const selectLineIndex = getSelectLineIndex();
  const count = getLineCount();
  const seekCount = selectLineIndex ? map.typingLineIndexes[selectLineIndex - 1] : null;

  const isTypingLine = map.typingLineIndexes.some((num) => num === count);
  const seekCountAdjust = (seekCount && seekCount === count) || (!isTypingLine && seekCount !== count + 1) ? -1 : 0;

  const adjustedCount = count + 1 + seekCountAdjust;

  const nextCount = map.typingLineIndexes.find((num) => num > adjustedCount);
  if (nextCount === undefined) return;
  const prevLine = map.lines[nextCount - 1];
  const nextLine = map.lines[nextCount];
  if (!prevLine || !nextLine) return;
  const playSpeed = getMediaSpeed();
  const isPaused = getIsPaused();
  const scene = getScene();
  const prevLineTime = (nextLine.time - prevLine.time) / playSpeed;
  const isTimeBuffer = scene === "practice" && !isPaused && prevLineTime > 1;

  const nextTime = Number(nextLine.time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);
  const newSelectLineIndex = map.typingLineIndexes.indexOf(nextCount) + 1;

  setSelectLineIndex(newSelectLineIndex);
  stopTimer();

  const newCount = getLineCountByTime(nextTime) + (isTimeBuffer ? 0 : 1);
  setLineCount(newCount);
  setupNextLine(map, newCount);

  seekYTPlayer(nextTime);
  setNotify(Symbol("▷"));
  scrollToTable(newSelectLineIndex);
  setLineProgressValue(nextTime - (map.lines[newCount]?.time ?? 0));
};

export const moveSetLine = (seekCount: number) => {
  const map = getBuiltMap();
  if (!map) return;
  const playSpeed = getMediaSpeed();
  const isPaused = getIsPaused();
  const scene = getScene();
  const isTimeBuffer = scene === "practice" && !isPaused;
  const seekTime = Number(map.lines[seekCount]?.time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

  seekYTPlayer(seekTime);
  const newCount = getLineCountByTime(seekTime) + (isTimeBuffer ? 0 : 1);
  setLineCount(newCount);
  setupNextLine(map, newCount);
  stopTimer();

  setLineProgressValue(seekTime - (map.lines[newCount]?.time ?? 0));
};

const scrollToTable = (newIndex: number) => {
  const lineElements = getPracticeLineElements();
  const element = lineElements[newIndex];

  if (element) {
    const viewport = element.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
    if (!viewport) return;

    const cardRect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const scrollPosition =
      viewport.scrollTop + cardRect.top - viewportRect.top - viewportRect.height / 2 + element.clientHeight / 2;

    viewport.scrollTo({ top: Math.max(0, scrollPosition), behavior: "instant" });
  }
};
