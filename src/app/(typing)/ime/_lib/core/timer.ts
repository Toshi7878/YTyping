import { Ticker } from "@pixi/ticker";
import { getExpectedWords } from "lyrics-ime-typing-engine";
import { readLyricsContainer } from "../atoms/ref";
import {
  readBuiltMap,
  readImeTypeOptions,
  readUtilityParams,
  readWipeLine,
  setCount,
  setDisplayLines,
  setExpectedWords,
  setNextDisplayLine,
  setSkipRemainTime,
  setTextareaPlaceholderType,
  setWipeCount,
} from "../atoms/state";
import { getYTCurrentTime } from "../atoms/yt-player";
import { DISPLAY_LINE_LENGTH } from "../const";
import type { BuiltImeMap } from "../type";

export const startTimer = () => {
  if (!imeTypeTicker.started) {
    imeTypeTicker.start();
  }
};

export const pauseTimer = () => {
  if (imeTypeTicker.started) {
    imeTypeTicker.stop();
  }
};

const wipeUpdate = ({ wipeCount, currentTime }: { wipeCount: number; currentTime: number }) => {
  const wipeElements = readLyricsContainer()?.lastElementChild?.lastElementChild;
  if (!wipeElements) return;
  const currentWipeElement = wipeElements.children[wipeCount];
  if (!currentWipeElement) return;

  const wipeLine = readWipeLine();
  const wipeChunk = wipeLine?.[wipeCount];

  if (wipeChunk && currentTime > wipeChunk.endTime) {
    currentWipeElement.setAttribute("style", completeWipe());
    setWipeCount(wipeCount + 1);
    return;
  }

  if (wipeChunk) {
    currentWipeElement.setAttribute("style", calcWipeProgress({ wipeChunk, currentTime }));
  }
};

const updateSkip = ({
  currentLine,
  count,
  nextLineStartTime,
  currentTime,
  wipeCount,
}: {
  currentLine: BuiltImeMap["lines"][number];
  count: number;
  nextLineStartTime: number;
  currentTime: number;
  wipeCount: number;
}) => {
  const SKIP_REMAIN_TIME = 5;

  const isWipeCompleted = count === 0 || (count >= 0 && currentLine.length === wipeCount);

  const remainTime = nextLineStartTime - currentTime;
  if (remainTime > SKIP_REMAIN_TIME && isWipeCompleted) {
    setTextareaPlaceholderType("skip");
    setSkipRemainTime(Number(Math.floor(remainTime - SKIP_REMAIN_TIME).toFixed()));
  } else {
    setTextareaPlaceholderType("normal");
    setSkipRemainTime(null);
  }
};

const updateDisplayLines = (newCount: number) => {
  const map = readBuiltMap();
  if (!map) return;

  const { lines } = map;

  const startIndex = Math.max(0, newCount - DISPLAY_LINE_LENGTH);
  const endIndex =
    newCount < DISPLAY_LINE_LENGTH ? Math.min(newCount, DISPLAY_LINE_LENGTH) : startIndex + DISPLAY_LINE_LENGTH;
  const displayLines = lines.slice(startIndex, endIndex);

  while (displayLines.length < DISPLAY_LINE_LENGTH) {
    displayLines.unshift([]);
  }

  setDisplayLines(displayLines);
  setNextDisplayLine([]);
  setWipeCount(0);

  const expectedWords = getExpectedWords(newCount, map.words);
  if (expectedWords) {
    setExpectedWords(expectedWords);
  }
};

const updateNextDisplayLine = ({
  nextLine,
  currentTime,
  count,
}: {
  nextLine: BuiltImeMap["lines"][number];
  currentTime: number;
  count: number;
}) => {
  const { nextDisplayLine } = readUtilityParams();
  if (nextDisplayLine.length === 0) {
    const nextTime = nextLine?.[0]?.startTime;
    if (!nextTime) return;

    const { enableNextLyrics } = readImeTypeOptions();
    if (enableNextLyrics && nextTime - currentTime < 3) {
      setNextDisplayLine(nextLine);

      const map = readBuiltMap();
      if (!map) return;

      const expectedWords = getExpectedWords(count + 1, map.words);
      if (expectedWords) {
        setExpectedWords(expectedWords);
      }
    }
  }
};

const timer = () => {
  const map = readBuiltMap();
  const currentTime = getYTCurrentTime();
  if (!map || currentTime === undefined) return;
  const { count, wipeCount } = readUtilityParams();

  wipeUpdate({ currentTime, wipeCount });

  const nextLine = map.lines[count];
  if (!nextLine) {
    setTextareaPlaceholderType("end");
    return;
  }

  updateNextDisplayLine({ nextLine, currentTime, count });

  const nextLineStartTime = nextLine[0]?.startTime;
  if (!nextLineStartTime) return;

  if (currentTime > nextLineStartTime) {
    const newCount = count + 1;

    setCount(newCount);
    updateDisplayLines(newCount);
  }

  const currentLine = map.lines?.[Math.max(0, count - 1)];
  if (!currentLine) return;
  updateSkip({ currentTime, count, currentLine, nextLineStartTime, wipeCount });
};

const imeTypeTicker = new Ticker();
imeTypeTicker.add(timer);

type WipeChunk = BuiltImeMap["lines"][number][number];
const completeWipe = () => {
  return "background:-webkit-linear-gradient(0deg, #ffa500 100%, white 0%);-webkit-background-clip:text;";
};

const calcWipeProgress = ({ wipeChunk, currentTime }: { wipeChunk: WipeChunk; currentTime: number }) => {
  const wipeDuration = wipeChunk.endTime - wipeChunk.startTime;
  const wipeTime = currentTime - wipeChunk.startTime;

  const wipeProgress = Math.round((wipeTime / wipeDuration) * 100 * 1000) / 1000;

  return `background:-webkit-linear-gradient(0deg, #ffa500 ${String(wipeProgress)}%, white 0%); -webkit-background-clip:text;`;
};
