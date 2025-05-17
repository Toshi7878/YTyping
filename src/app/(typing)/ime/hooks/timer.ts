import { Ticker } from "@pixi/ticker";
import { useLyricsContainer } from "../atom/refAtoms";
import { useReadPlaySpeed } from "../atom/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useReadMap,
  useSetCount,
  useSetDisplayLines,
  useSetJudgedWords,
  useSetNextDisplayLine,
  useSetSkipRemainTime,
  useSetWipeCount,
} from "../atom/stateAtoms";
import { DISPLAY_LINE_LENGTH } from "../ts/const";
import { ParseMap } from "../type";
import { useGetTime } from "./getYTTime";

const imeTypeTicker = new Ticker();

export const useTimerRegistration = () => {
  const playTimer = useTimer();

  const addTimer = () => {
    imeTypeTicker.add(playTimer);
  };

  const removeTimer = () => {
    imeTypeTicker.stop();
    imeTypeTicker.remove(playTimer);
  };

  return { addTimer, removeTimer };
};

export const useTimerControls = () => {
  const startTimer = () => {
    if (!imeTypeTicker.started) {
      imeTypeTicker.start();
    }
  };

  const pauseTimer = () => {
    if (imeTypeTicker.started) {
      imeTypeTicker.stop();
    }
  };

  const setFrameRate = (rate: number) => {
    imeTypeTicker.maxFPS = rate;
    imeTypeTicker.minFPS = rate;
  };

  return { startTimer, pauseTimer, setFrameRate };
};

const useTimer = () => {
  const readMap = useReadMap();

  const setNextDisplayLine = useSetNextDisplayLine();
  const setDisplayLines = useSetDisplayLines();
  const readPlaySpeed = useReadPlaySpeed();
  const { readGameUtilParams, readWipeLine } = useReadGameUtilParams();

  const { getCurrentOffsettedYTTime, getConstantOffsettedYTTime } = useGetTime();
  const { readLyricsContainer } = useLyricsContainer();
  const { calcWipeProgress, completeWipe } = useCalcWipeProgress();
  const getJudgedWords = useGetJudgedWords();
  const setJudgedWords = useSetJudgedWords();
  const setSkipRemainTime = useSetSkipRemainTime();
  const setCount = useSetCount();
  const setWipeCount = useSetWipeCount();

  const updateSkip = ({
    currentLine,
    count,
    nextLineStartTime,
    constantOffsettedYTTime,
    wipeCount,
  }: {
    currentLine: ParseMap["lines"][number];
    count: number;
    nextLineStartTime: number;
    constantOffsettedYTTime: number;
    wipeCount: number;
  }) => {
    const SKIP_REMAIN_TIME = 5;

    const isWipeCompleted = count == 0 || (count >= 0 && currentLine.length == wipeCount + 1) ? true : false;

    const remainTime = nextLineStartTime - constantOffsettedYTTime;
    if (remainTime > SKIP_REMAIN_TIME && isWipeCompleted) {
      setSkipRemainTime(Number(Math.floor(remainTime - SKIP_REMAIN_TIME).toFixed()));
    } else {
      setSkipRemainTime(null);
    }
  };

  const wipeUpdate = ({
    wipeCount,
    currentOffesettedYTTime,
  }: {
    wipeCount: number;
    currentOffesettedYTTime: number;
  }) => {
    const wipeElements = readLyricsContainer()?.lastElementChild?.lastElementChild;
    if (!wipeElements) return;
    const currentWipeElement = wipeElements.children[wipeCount];
    if (!currentWipeElement) return;

    const wipeLine = readWipeLine();
    const nextWipeChunk = wipeLine?.[wipeCount + 1];

    if (nextWipeChunk && currentOffesettedYTTime > nextWipeChunk.time) {
      currentWipeElement.setAttribute("style", completeWipe());
      setWipeCount(wipeCount + 1);
      return;
    }

    const wipeChunk = wipeLine?.[wipeCount];

    if (wipeChunk && nextWipeChunk) {
      currentWipeElement.setAttribute("style", calcWipeProgress({ wipeChunk, nextWipeChunk, currentOffesettedYTTime }));
    }
  };

  const updateDisplayLines = (newCount: number) => {
    const { lines } = readMap();

    const startIndex = Math.max(0, newCount - DISPLAY_LINE_LENGTH);

    const endIndex =
      newCount < DISPLAY_LINE_LENGTH ? Math.min(newCount, DISPLAY_LINE_LENGTH) : startIndex + DISPLAY_LINE_LENGTH;

    const displayLines = lines.slice(startIndex, endIndex);

    while (displayLines.length < DISPLAY_LINE_LENGTH) {
      displayLines.unshift([]);
    }

    setDisplayLines(displayLines);
    setNextDisplayLine([]);
    setJudgedWords(getJudgedWords(newCount));
    setWipeCount(0);
  };

  const updateNextDisplayLine = ({
    nextLine,
    constantOffsettedYTTime,
    count,
  }: {
    nextLine: ParseMap["lines"][number];
    constantOffsettedYTTime: number;
    count: number;
  }) => {
    const { nextDisplayLine } = readGameUtilParams();
    if (nextDisplayLine.length === 0) {
      const nextTime = nextLine[0].time / readPlaySpeed().playSpeed;

      if (nextTime - constantOffsettedYTTime < 3) {
        setNextDisplayLine(nextLine);
        setJudgedWords(getJudgedWords(count + 1));
      }
    }
  };

  return () => {
    const { count, wipeCount } = readGameUtilParams();
    const map = readMap();
    const currentOffesettedYTTime = getCurrentOffsettedYTTime();
    const constantOffsettedYTTime = getConstantOffsettedYTTime(currentOffesettedYTTime);

    wipeUpdate({ currentOffesettedYTTime, wipeCount });

    const nextLine = map.lines[count];
    if (!nextLine) return;

    const nextLineStartTime = nextLine[0]?.time / readPlaySpeed().playSpeed;

    updateNextDisplayLine({ nextLine, constantOffsettedYTTime, count });
    if (currentOffesettedYTTime > nextLineStartTime) {
      const newCount = count + 1;

      setCount(newCount);
      updateDisplayLines(newCount);
    }

    const currentLine = map.lines?.[Math.max(0, count - 1)];
    if (!currentLine) return;
    updateSkip({ constantOffsettedYTTime, count, currentLine, nextLineStartTime, wipeCount });
  };
};

type WipeChunk = ParseMap["lines"][number][number];
const useCalcWipeProgress = () => {
  const completeWipe = () => {
    return `background:-webkit-linear-gradient(0deg, #ffa500 100%, white 0%);-webkit-background-clip:text;`;
  };

  const calcWipeProgress = ({
    wipeChunk,
    nextWipeChunk,
    currentOffesettedYTTime,
  }: {
    wipeChunk: WipeChunk;
    nextWipeChunk: WipeChunk;
    currentOffesettedYTTime: number;
  }) => {
    const wipeDuration = nextWipeChunk.time - wipeChunk.time;
    const wipeTime = currentOffesettedYTTime - wipeChunk.time;

    const wipeProgress = Math.round((wipeTime / wipeDuration) * 100 * 1000) / 1000;

    return `background:-webkit-linear-gradient(0deg, #ffa500 ${String(
      wipeProgress
    )}%, white 0%); -webkit-background-clip:text;`;
  };

  return { calcWipeProgress, completeWipe };
};

function useGetJudgedWords() {
  const readMap = useReadMap();

  return (count: number) => {
    return readMap().words.slice(0, count).flat(1);
  };
}
