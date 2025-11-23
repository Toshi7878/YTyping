import { Ticker } from "@pixi/ticker";
import { readRawMap } from "../atoms/map-reducer";
import { setTimeInputValue } from "../atoms/ref";
import {
  readUtilityParams,
  readYTPlayer,
  setIsTimeInputValid,
  setTimeLineIndex,
  setTimeRangeValue,
} from "../atoms/state";

export const startTimer = () => {
  if (!editTicker.started) {
    editTicker.start();
  }
};
export const stopTimer = () => {
  if (editTicker.started) {
    editTicker.stop();
  }
};

const timer = () => {
  const YTPlayer = readYTPlayer();
  if (!YTPlayer) {
    editTicker.stop();
    return;
  }
  const currentTime = YTPlayer.getCurrentTime();
  setTimeRangeValue(currentTime);
  const { directEditingIndex, timeLineIndex } = readUtilityParams();
  if (!directEditingIndex) {
    setTimeInputValue(currentTime.toFixed(3));
    setIsTimeInputValid(false);
  }

  const nextLineIndex = timeLineIndex + 1;

  const map = readRawMap();
  const nextLine = map[nextLineIndex];
  if (nextLine && Number(currentTime) >= Number(nextLine.time)) {
    setTimeLineIndex(nextLineIndex);
  }
};

const editTicker = new Ticker();
editTicker.add(timer);

editTicker.maxFPS = 60;
editTicker.minFPS = 60;
