import { Ticker } from "@pixi/ticker";
import { readMap } from "../atoms/map-reducer";
import { readYTPlayer, setTimeInputValue } from "../atoms/ref";
import { readUtilityParams, setIsTimeInputValid, setTimeLineIndex, setTimeRangeValue } from "../atoms/state";

const editTicker = new Ticker();

export const addTimer = () => {
  editTicker.add(timer);
};

export const removeTimer = () => {
  editTicker.stop();
  editTicker.remove(timer);
};

export const timerControls = {
  startTimer: () => {
    if (!editTicker.started) {
      editTicker.start();
      setIsTimeInputValid(false);
    }
  },
  stopTimer: () => {
    if (editTicker.started) {
      editTicker.stop();
    }
  },
};

const timer = () => {
  const YTPlayer = readYTPlayer();
  if (!YTPlayer) return;
  const currentTime = YTPlayer.getCurrentTime();

  setTimeRangeValue(currentTime);

  const { directEditingIndex, timeLineIndex } = readUtilityParams();
  if (!directEditingIndex) {
    setTimeInputValue(currentTime.toFixed(3));
  }

  const nextLineIndex = timeLineIndex + 1;

  const map = readMap();
  const nextLine = map[nextLineIndex];
  if (nextLine && Number(currentTime) >= Number(nextLine.time)) {
    setTimeLineIndex(nextLineIndex);
  }
};
