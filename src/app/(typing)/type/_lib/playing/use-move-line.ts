import { useLineCount, usePlayer, useProgress, useReadYTStatus, useResultCards } from "../atoms/read-atoms";
import { useReadPlaySpeed } from "../atoms/speed-reducer-atoms";
import { useReadGameUtilParams, useReadMap, useSetLineSelectIndex, useSetNotify } from "../atoms/state-atoms";
import { timerControls, useSetupNextLine } from "./timer/use-timer";
import { useGetLineCountByTime } from "./use-get-line-count-by-time";

const SEEK_BUFFER_TIME = 0.8;

export const useMoveLine = () => {
  const { readPlayer } = usePlayer();
  const setLineSelectIndex = useSetLineSelectIndex();
  const setNotify = useSetNotify();
  const updateLine = useSetupNextLine();
  const getSeekLineCount = useGetLineCountByTime();

  const { readResultCards } = useResultCards();

  const readPlaySpeed = useReadPlaySpeed();
  const readMap = useReadMap();
  const { readCount, writeCount } = useLineCount();
  const { readYTStatus } = useReadYTStatus();

  const readGameStateUtils = useReadGameUtilParams();
  const { readLineProgress } = useProgress();

  const movePrevLine = () => {
    const map = readMap();
    if (!map) return;

    const { scene } = readGameStateUtils();
    const { isPaused } = readYTStatus();
    const isPracticeScene = scene === "practice";
    const isTimeBuffer = isPracticeScene && !isPaused;

    const count = readCount();
    const referenceCount = count + 1 - (isTimeBuffer ? 0 : 1);

    const { typingLineIndexes } = map;

    let prevCount: number | undefined;
    for (let i = typingLineIndexes.length - 1; i >= 0; i--) {
      const candidate = typingLineIndexes[i];
      if (candidate < referenceCount) {
        prevCount = candidate;
        break;
      }
    }

    if (prevCount === undefined) return;

    const { playSpeed } = readPlaySpeed();

    const timeIndex = prevCount + (isTimeBuffer ? 0 : 1);
    const prevTimeRaw = Number(map.mapData[timeIndex].time);
    const prevTime = prevTimeRaw - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

    const newLineSelectIndex = typingLineIndexes.indexOf(prevCount) + 1;
    setLineSelectIndex(newLineSelectIndex);
    timerControls.stopTimer();

    const newCount = getSeekLineCount(prevTime);
    writeCount(newCount);
    updateLine(newCount);

    const seekTargetTime = isTimeBuffer ? prevTime : map.mapData[prevCount].time;
    readPlayer().seekTo(seekTargetTime, true);
    setNotify(Symbol("◁"));
    scrollToCard(newLineSelectIndex);
    const newLine = map.mapData[newCount];
    readLineProgress().value = isTimeBuffer ? prevTime - newLine.time : 0;
  };

  const moveNextLine = () => {
    const map = readMap();
    if (!map) return;
    const { lineSelectIndex } = readGameStateUtils();
    const count = readCount();
    const seekCount = lineSelectIndex ? map.typingLineIndexes[lineSelectIndex - 1] : null;
    const seekCountAdjust = seekCount && seekCount === count ? -1 : 0;

    const adjustedCount = count + 1 + seekCountAdjust;

    const nextCount = map.typingLineIndexes.find((num) => num > adjustedCount);
    if (nextCount === undefined) return;
    const { playSpeed } = readPlaySpeed();
    const { scene } = readGameStateUtils();
    const { isPaused } = readYTStatus();
    const prevLineTime = map.mapData[nextCount].time - map.mapData[nextCount - 1].time / playSpeed;
    const isTimeBuffer = scene === "practice" && !isPaused && prevLineTime > 1;
    const nextTime = Number(map.mapData[nextCount].time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);
    const newLineSelectIndex = map.typingLineIndexes.indexOf(nextCount) + 1;

    setLineSelectIndex(newLineSelectIndex);
    timerControls.stopTimer();

    const newCount = getSeekLineCount(nextTime) + (isTimeBuffer ? 0 : 1);
    writeCount(newCount);
    updateLine(newCount);

    readPlayer().seekTo(nextTime, true);
    setNotify(Symbol("▷"));
    scrollToCard(newLineSelectIndex);
    readLineProgress().value = nextTime - map.mapData[newCount].time;
  };

  const moveSetLine = (seekCount: number) => {
    const map = readMap();
    if (!map) return;
    const { isPaused } = readYTStatus();
    const { playSpeed } = readPlaySpeed();
    const { scene } = readGameStateUtils();
    const isTimeBuffer = scene === "practice" && !isPaused;
    const seekTime = Number(map.mapData[seekCount].time) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

    readPlayer().seekTo(seekTime, true);
    const newCount = getSeekLineCount(seekTime) + (isTimeBuffer ? 0 : 1);
    writeCount(newCount);
    updateLine(newCount);
    timerControls.stopTimer();

    readLineProgress().value = seekTime - map.mapData[newCount].time;
  };

  const drawerSelectColorChange = (newLineSelectIndex: number) => {
    const resultCards = readResultCards();
    for (let i = 0; i < resultCards.length; i++) {
      const card = resultCards[i];

      if (!card) {
        continue;
      }

      if (String(newLineSelectIndex) === card.dataset.count) {
        resultCards[i].classList.add("result-line-select-outline");
        resultCards[i].classList.remove("result-line-hover");
      } else {
        resultCards[i].classList.add("result-line-hover");
        resultCards[i].classList.remove("result-line-select-outline");
      }
    }
  };
  const scrollToCard = (newIndex: number) => {
    const resultCards = readResultCards();

    const card: HTMLDivElement = resultCards[newIndex];

    if (card) {
      const drawerBody = card.parentNode as HTMLDivElement;

      const cardTop = card.offsetTop;
      const drawerHeight = drawerBody.clientHeight;
      const scrollPosition = cardTop - drawerHeight / 2 + card.clientHeight / 2;

      drawerBody.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: "instant",
      });
    }
  };

  return { movePrevLine, moveNextLine, moveSetLine, scrollToCard, drawerSelectColorChange };
};
