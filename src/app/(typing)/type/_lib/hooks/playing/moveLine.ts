import { useLineCount, usePlayer, useProgress, useResultCards } from "../../atoms/refAtoms";
import { useReadPlaySpeed } from "../../atoms/speedReducerAtoms";
import { useReadGameUtilParams, useReadMap, useSetLineSelectIndex, useSetNotify } from "../../atoms/stateAtoms";
import { useGetSeekLineCount } from "./timer/getLineCountByTime";
import { useTimerControls, useUpdateLine } from "./timer/timer";

const SEEK_BUFFER_TIME = 0.8;

export const useMoveLine = () => {
  const { readPlayer } = usePlayer();
  const setLineSelectIndex = useSetLineSelectIndex();
  const setNotify = useSetNotify();
  const updateLine = useUpdateLine();
  const getSeekLineCount = useGetSeekLineCount();

  const { readResultCards } = useResultCards();

  const readPlaySpeed = useReadPlaySpeed();
  const readMap = useReadMap();
  const { readCount, writeCount } = useLineCount();

  const { pauseTimer } = useTimerControls();
  const readGameStateUtils = useReadGameUtilParams();
  const { readLineProgress } = useProgress();

  const movePrevLine = () => {
    const map = readMap();
    if (!map) return;
    const { scene } = readGameStateUtils();
    const count = readCount() - (scene === "replay" ? 1 : 0);
    const prevCount = structuredClone(map.typingLineIndexes)
      .reverse()
      .find((num) => num < count);

    if (prevCount === undefined) return;

    const playSpeed = readPlaySpeed().playSpeed;
    const isPaused = readPlayer().getPlayerState() === 2;

    const isTimeBuffer = scene === "practice" && !isPaused;
    const prevTime = Number(map.mapData[prevCount]["time"]) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);
    const newLineSelectIndex = map.typingLineIndexes.indexOf(prevCount) + 1;
    setLineSelectIndex(newLineSelectIndex + (isTimeBuffer ? 0 : -1));
    pauseTimer();

    const newCount = getSeekLineCount(prevTime) + (isTimeBuffer ? 0 : -1);
    writeCount(newCount);
    updateLine(newCount);

    readPlayer().seekTo(prevTime, true);
    setNotify(Symbol(`◁`));
    drawerSelectColorChange(newCount);
    scrollToCard(newLineSelectIndex);
    readLineProgress().value = prevTime - map.mapData[newCount - 1].time;
  };

  const moveNextLine = () => {
    const map = readMap();
    if (!map) return;
    const { lineSelectIndex } = readGameStateUtils();
    const seekCount = lineSelectIndex ? map.typingLineIndexes[lineSelectIndex - 1] : null;
    const seekCountAdjust = seekCount && seekCount === readCount() ? 0 : -1;

    const count = readCount() + seekCountAdjust;
    const nextCount = map.typingLineIndexes.find((num) => num > count);

    if (nextCount === undefined) return;

    const playSpeed = readPlaySpeed().playSpeed;

    const prevLineTime =
      (nextCount > 1 ? map.mapData[nextCount]["time"] - map.mapData[nextCount - 1]["time"] : 0) / playSpeed;

    const { scene } = readGameStateUtils();

    const isPaused = readPlayer().getPlayerState() === 2;
    const isTimeBuffer = scene === "practice" && !isPaused && prevLineTime > 1;

    const nextTime = Number(map.mapData[nextCount]["time"]) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

    const newLineSelectIndex = map.typingLineIndexes.indexOf(nextCount) + 1;

    setLineSelectIndex(newLineSelectIndex);
    pauseTimer();

    const newCount = getSeekLineCount(nextTime) + (isTimeBuffer ? 0 : 1);
    writeCount(newCount);
    updateLine(newCount);

    readPlayer().seekTo(nextTime, true);
    setNotify(Symbol(`▷`));
    drawerSelectColorChange(newCount);
    scrollToCard(newLineSelectIndex);
    readLineProgress().value = nextTime - map.mapData[newCount - 1].time;
  };

  const moveSetLine = (seekCount: number) => {
    const map = readMap();
    if (!map) return;
    const isPaused = readPlayer().getPlayerState() === 2;
    const playSpeed = readPlaySpeed().playSpeed;
    const { scene, lineSelectIndex } = readGameStateUtils();
    const isTimeBuffer = scene === "practice" && !isPaused;
    const seekTime = Number(map.mapData[seekCount]["time"]) - (isTimeBuffer ? SEEK_BUFFER_TIME * playSpeed : 0);

    if (lineSelectIndex !== seekCount) {
      drawerSelectColorChange(seekCount);
    }

    readPlayer().seekTo(seekTime, true);
    const newCount = getSeekLineCount(seekTime) + (isTimeBuffer ? 0 : 1);
    writeCount(newCount);
    updateLine(newCount);
    pauseTimer();

    readLineProgress().value = seekTime - map.mapData[newCount - 1].time;
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
