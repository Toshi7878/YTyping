import { readLineCount, readLineProgress, readResultCards, readYTPlayer, writeLineCount } from "../atoms/ref";
import { readPlaySpeed } from "../atoms/speed-reducer";
import { readBuiltMap, readUtilityParams, setLineSelectIndex, setNotify } from "../atoms/state";
import { getLineCountByTime } from "./get-line-count-by-time";
import { setupLine, timerControls } from "./timer/use-timer";

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

  const { playSpeed } = readPlaySpeed();

  const timeIndex = prevCount + (isTimeBuffer ? 0 : 1);
  const prevTimeRaw = Number(map.mapData[timeIndex]?.time);
  const prevTime = prevTimeRaw - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

  const newLineSelectIndex = typingLineIndexes.indexOf(prevCount) + 1;
  setLineSelectIndex(newLineSelectIndex);
  timerControls.stopTimer();

  const newCount = getLineCountByTime(prevTime);
  writeLineCount(newCount);
  setupLine(newCount);

  const seekTargetTime = isTimeBuffer ? prevTime : (map.mapData[prevCount]?.time ?? 0);
  const YTPlayer = readYTPlayer();
  YTPlayer?.seekTo(seekTargetTime, true);
  setNotify(Symbol("◁"));
  scrollToCard(newLineSelectIndex);
  const newLine = map.mapData[newCount];
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
  const seekCountAdjust = seekCount && seekCount === count ? -1 : 0;

  const adjustedCount = count + 1 + seekCountAdjust;

  const nextCount = map.typingLineIndexes.find((num) => num > adjustedCount);
  if (nextCount === undefined) return;
  const prevLine = map.mapData[nextCount - 1];
  const nextLine = map.mapData[nextCount];
  if (!prevLine || !nextLine) return;
  const { playSpeed } = readPlaySpeed();
  const { scene, isPaused } = readUtilityParams();
  const prevLineTime = nextLine.time - prevLine.time / playSpeed;
  const isTimeBuffer = scene === "practice" && !isPaused && prevLineTime > 1;

  const nextTime = Number(nextLine.time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);
  const newLineSelectIndex = map.typingLineIndexes.indexOf(nextCount) + 1;

  setLineSelectIndex(newLineSelectIndex);
  timerControls.stopTimer();

  const newCount = getLineCountByTime(nextTime) + (isTimeBuffer ? 0 : 1);
  writeLineCount(newCount);
  setupLine(newCount);

  const YTPlayer = readYTPlayer();
  YTPlayer?.seekTo(nextTime, true);
  setNotify(Symbol("▷"));
  scrollToCard(newLineSelectIndex);
  const lineProgress = readLineProgress();
  if (lineProgress) {
    lineProgress.value = nextTime - (map.mapData[newCount]?.time ?? 0);
  }
};

export const moveSetLine = (seekCount: number) => {
  const map = readBuiltMap();
  if (!map) return;
  const { playSpeed } = readPlaySpeed();
  const { scene, isPaused } = readUtilityParams();
  const isTimeBuffer = scene === "practice" && !isPaused;
  const seekTime = Number(map.mapData[seekCount]?.time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

  const YTPlayer = readYTPlayer();
  YTPlayer?.seekTo(seekTime, true);
  const newCount = getLineCountByTime(seekTime) + (isTimeBuffer ? 0 : 1);
  writeLineCount(newCount);
  setupLine(newCount);
  timerControls.stopTimer();

  const lineProgress = readLineProgress();
  if (lineProgress) {
    lineProgress.value = seekTime - (map.mapData[newCount]?.time ?? 0);
  }
};

// moveSetLineに移行
export const drawerSelectColorChange = (newLineSelectIndex: number) => {
  const resultCards = readResultCards();
  for (const card of resultCards) {
    if (String(newLineSelectIndex) === card.dataset.count) {
      card.classList.add("result-line-select-outline");
      card.classList.remove("result-line-hover");
    } else {
      card.classList.add("result-line-hover");
      card.classList.remove("result-line-select-outline");
    }
  }
};

const scrollToCard = (newIndex: number) => {
  const resultCards = readResultCards();

  const card = resultCards[newIndex];

  if (card) {
    const drawerBody = card.parentNode as HTMLDivElement;

    const cardTop = card.offsetTop;
    const drawerHeight = drawerBody.clientHeight;
    const scrollPosition = cardTop - drawerHeight / 2 + card.clientHeight / 2;

    drawerBody.scrollTo({ top: Math.max(0, scrollPosition), behavior: "instant" });
  }
};
