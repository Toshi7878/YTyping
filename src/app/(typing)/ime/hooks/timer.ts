import { Ticker } from "@pixi/ticker";
import { RESET } from "jotai/utils";
import { useLineCount, useLyricsContainer, useWipeCount } from "../atom/refAtoms";
import { useReadPlaySpeed } from "../atom/speedReducerAtoms";
import {
  useReadDisplayLines,
  useReadMap,
  useReadNextDisplayLine,
  useSetDisplayLines,
  useSetJudgedWords,
  useSetNextDisplayLine,
  useSetSkipRemainTime,
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
  const readNextDisplayLine = useReadNextDisplayLine();

  const { readCount, writeCount } = useLineCount();
  const { readWipeCount, writeWipeCount } = useWipeCount();

  const { getCurrentOffsettedYTTime, getConstantOffsettedYTTime } = useGetTime();
  const { readLyricsContainer } = useLyricsContainer();
  const { readWipeLine } = useReadDisplayLines();
  const { calcWipeProgress, completeWipe } = useCalcWipeProgress();
  const getJudgedWords = useGetJudgedWords();
  const setJudgedWords = useSetJudgedWords();
  const setSkipRemainTime = useSetSkipRemainTime();

  const updateSkip = ({
    currentLine,
    count,
    nextLineStartTime,
    constantOffsettedYTTime,
  }: {
    currentLine: ParseMap["lines"][number];
    count: number;
    nextLineStartTime: number;
    constantOffsettedYTTime: number;
  }) => {
    const SKIP_REMAIN_TIME = 5;

    const isWipeCompleted = count == 0 || (count >= 0 && currentLine.length == readWipeCount() + 1) ? true : false;

    const remainTime = nextLineStartTime - constantOffsettedYTTime;
    if (remainTime > SKIP_REMAIN_TIME && isWipeCompleted) {
      setSkipRemainTime(Number(Math.floor(remainTime - SKIP_REMAIN_TIME).toFixed()));
    } else {
      setSkipRemainTime(null);
    }
  };

  const wipeUpdate = ({ currentOffesettedYTTime }: { currentOffesettedYTTime: number }) => {
    const wipeElements = readLyricsContainer()?.lastElementChild?.lastElementChild;
    if (!wipeElements) return;
    const wipeCount = readWipeCount();
    const currentWipeElement = wipeElements.children[wipeCount];
    if (!currentWipeElement) return;

    const wipeLine = readWipeLine();
    const nextWipeChunk = wipeLine?.[wipeCount + 1];

    if (nextWipeChunk && currentOffesettedYTTime > nextWipeChunk.time) {
      currentWipeElement.setAttribute("style", completeWipe());
      writeWipeCount(wipeCount + 1);
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
    setNextDisplayLine(RESET);
    setJudgedWords(getJudgedWords(newCount));
    writeWipeCount(0);
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
    const nextDisplayLine = readNextDisplayLine();
    if (nextDisplayLine.length === 0) {
      const nextTime = nextLine[0].time / readPlaySpeed().playSpeed;

      if (nextTime - constantOffsettedYTTime < 3) {
        setNextDisplayLine(nextLine);
        setJudgedWords(getJudgedWords(count));
      }
    }
  };

  return () => {
    const map = readMap();
    const count = readCount();
    const currentOffesettedYTTime = getCurrentOffsettedYTTime();
    const constantOffsettedYTTime = getConstantOffsettedYTTime(currentOffesettedYTTime);

    wipeUpdate({ currentOffesettedYTTime });

    const nextLine = map.lines[count];
    if (!nextLine) return;

    const nextLineStartTime = nextLine[0]?.time / readPlaySpeed().playSpeed;

    updateNextDisplayLine({ nextLine, constantOffsettedYTTime, count });
    if (currentOffesettedYTTime > nextLineStartTime) {
      const newCount = count + 1;
      writeCount(newCount);
      updateDisplayLines(newCount);
    }

    const currentLine = map.lines?.[Math.max(0, count - 1)];
    if (!currentLine) return;
    updateSkip({ constantOffsettedYTTime, count, currentLine, nextLineStartTime });
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
