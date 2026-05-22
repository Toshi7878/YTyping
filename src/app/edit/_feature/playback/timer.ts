import { Ticker } from "@pixi/ticker";
import { getRawMap } from "../map-table/map-reducer";
import { getDirectEditingIndex, getPlayingLineIndex, setPlayingLineIndex } from "../map-table/map-table";
import { setTimeValue } from "../tabs/editor/select-line-input";
import { YTPlayer } from "../youtube-player";
import { setTimeRangeValue } from "./time-range";

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
  if (!YTPlayer.isMount()) {
    editTicker.stop();
    return;
  }
  const currentTime = YTPlayer.getCurrentTime();
  setTimeRangeValue(currentTime);
  const directEditingIndex = getDirectEditingIndex();
  const playingLineIndex = getPlayingLineIndex();

  if (!directEditingIndex) {
    setTimeValue(currentTime.toFixed(3));
  }

  const nextLineIndex = playingLineIndex + 1;

  const map = getRawMap();
  const nextLine = map[nextLineIndex];
  if (nextLine && Number(currentTime) >= Number(nextLine.time)) {
    setPlayingLineIndex(nextLineIndex);
  }
};

const editTicker = new Ticker();
editTicker.add(timer);
editTicker.maxFPS = 60;
