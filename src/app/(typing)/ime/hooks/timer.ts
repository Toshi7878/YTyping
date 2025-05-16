import { Ticker } from "@pixi/ticker";
import { useLineCount, useLyricsContainer, useWipeCount } from "../atom/refAtoms";
import { useReadDisplayLines, useReadMap, useSetDisplayLines } from "../atom/stateAtoms";
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
  const setDisplayLines = useSetDisplayLines();

  const { readCount, writeCount } = useLineCount();
  const { readWipeCount, writeWipeCount } = useWipeCount();

  const { getCurrentOffsettedYTTime } = useGetTime();
  const { readLyricsContainer } = useLyricsContainer();
  const { readWipeLine } = useReadDisplayLines();
  const { updateWipe, completeWipe } = useUpdateWipe();

  const update = ({ currentOffesettedYTTime }: { currentOffesettedYTTime: number }) => {
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
      currentWipeElement.setAttribute("style", updateWipe({ wipeChunk, nextWipeChunk, currentOffesettedYTTime }));
    }
  };

  const updateLyrics = (newCount: number) => {
    const { lines } = readMap();

    const startIndex = Math.max(0, newCount - DISPLAY_LINE_LENGTH);

    const endIndex =
      newCount < DISPLAY_LINE_LENGTH ? Math.min(newCount, DISPLAY_LINE_LENGTH) : startIndex + DISPLAY_LINE_LENGTH;

    const displayLines = lines.slice(startIndex, endIndex);

    while (displayLines.length < DISPLAY_LINE_LENGTH) {
      displayLines.unshift([]);
    }

    setDisplayLines(displayLines);
    writeWipeCount(0);
  };

  return () => {
    const map = readMap();
    const count = readCount();
    const currentOffesettedYTTime = getCurrentOffsettedYTTime();

    update({ currentOffesettedYTTime });

    const nextLine = map.lines[count]?.[0];
    const nextLineTime = nextLine?.time;
    if (nextLine && currentOffesettedYTTime > nextLineTime) {
      const newCount = count + 1;
      writeCount(newCount);
      updateLyrics(newCount);
    }
  };
};

type WipeChunk = ParseMap["lines"][number][number];
const useUpdateWipe = () => {
  const completeWipe = () => {
    return `background:-webkit-linear-gradient(0deg, #ffa500 100%, white 0%);-webkit-background-clip:text;`;
  };

  const updateWipe = ({
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

  return { updateWipe, completeWipe };
};
