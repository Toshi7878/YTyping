import { useCountRef, usePlayer, useResultCards } from "../../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../../atoms/speedReducerAtoms";
import {
  useGameStateUtilsRef,
  useMapStateRef,
  useSetLineSelectIndexState,
  useSetNotifyState,
} from "../../atoms/stateAtoms";
import { useGetSeekLineCount } from "./timer-hooks/useSeekGetLineCount";
import { useTimerControls, useUpdateLine } from "./timer-hooks/useTimer";

export const useMoveLine = () => {
  const { readPlayer } = usePlayer();
  const setLineSelectIndex = useSetLineSelectIndexState();
  const setNotify = useSetNotifyState();
  const updateLine = useUpdateLine();
  const getSeekLineCount = useGetSeekLineCount();

  const { readResultCards } = useResultCards();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readMap = useMapStateRef();
  const { readCount, writeCount } = useCountRef();

  const { pauseTimer } = useTimerControls();
  const readGameStateUtils = useGameStateUtilsRef();

  const movePrevLine = () => {
    const map = readMap();
    const { scene } = readGameStateUtils();
    const count = readCount() - (scene === "replay" ? 1 : 0);
    const prevCount = structuredClone(map.typingLineIndexes)
      .reverse()
      .find((num) => num < count);

    if (prevCount === undefined) {
      return;
    }
    const playSpeed = readPlaySpeed().playSpeed;

    const seekBuffer = scene === "practice" ? 1 * playSpeed : 0;
    const prevTime = Number(map.mapData[prevCount]["time"]) - seekBuffer;
    const newLineSelectIndex = map.typingLineIndexes.indexOf(prevCount) + 1;
    setLineSelectIndex(newLineSelectIndex);
    pauseTimer();

    const newCount = getSeekLineCount(prevTime);
    writeCount(newCount);
    updateLine(newCount);

    readPlayer().seekTo(prevTime, true);
    setNotify(Symbol(`◁`));
    scrollToCard(newLineSelectIndex);
  };

  const moveNextLine = () => {
    const map = readMap();
    const { lineSelectIndex } = readGameStateUtils();
    const seekCount = lineSelectIndex ? map.typingLineIndexes[lineSelectIndex - 1] : null;
    const seekCountAdjust = seekCount && seekCount === readCount() ? 0 : -1;

    const count = readCount() + seekCountAdjust;
    const nextCount = map.typingLineIndexes.find((num) => num > count);

    if (nextCount === undefined) {
      return;
    }

    const playSpeed = readPlaySpeed().playSpeed;

    const prevLineTime =
      (nextCount > 1 ? map.mapData[nextCount]["time"] - map.mapData[nextCount - 1]["time"] : 0) / playSpeed;

    const { scene } = readGameStateUtils();
    const seekBuffer = scene === "practice" && prevLineTime > 1 ? 1 * playSpeed : 0;
    const nextTime = Number(map.mapData[nextCount]["time"]) - seekBuffer;

    const newLineSelectIndex = map.typingLineIndexes.indexOf(nextCount) + 1;

    setLineSelectIndex(newLineSelectIndex);
    pauseTimer();

    const newCount = getSeekLineCount(nextTime);
    writeCount(newCount);
    updateLine(newCount);

    readPlayer().seekTo(nextTime, true);
    setNotify(Symbol(`▷`));
    scrollToCard(newLineSelectIndex);
  };

  const moveSetLine = (seekCount: number) => {
    const map = readMap();
    const playSpeed = readPlaySpeed().playSpeed;
    const { scene } = readGameStateUtils();
    const seekBuffer = scene === "practice" ? 1 * playSpeed : 0;
    const seekTime = Number(map.mapData[seekCount]["time"]) - seekBuffer;

    readPlayer().seekTo(seekTime, true);
    const newCount = getSeekLineCount(seekTime);
    writeCount(newCount);
    updateLine(newCount);
    pauseTimer();
  };

  const drawerSelectColorChange = (newLineSelectIndex: number) => {
    const resultCards = readResultCards();
    const map = readMap();
    for (let i = 0; i < resultCards.length; i++) {
      const card = resultCards[i];

      if (!card) {
        continue;
      }

      const index = map.typingLineIndexes[newLineSelectIndex];
      if (index === i) {
        resultCards[i].classList.add("result-line-select-outline");
        resultCards[i].classList.remove("result-line-hover");
      } else {
        resultCards[i].classList.add("result-line-hover");
        resultCards[i].classList.remove("result-line-select-outline");
      }
    }
  };

  const scrollToCard = (newIndex: number) => {
    const map = readMap();
    const resultCards = readResultCards();

    const card: HTMLDivElement = resultCards[newIndex];

    if (card) {
      const drawerBody = card.parentNode as HTMLDivElement;
      const scrollHeight = drawerBody.scrollHeight;
      drawerBody.scrollTop = (scrollHeight * (newIndex - 2)) / map.typingLineIndexes.length;
    }
  };

  return { movePrevLine, moveNextLine, moveSetLine, scrollToCard, drawerSelectColorChange };
};
