import { Ticker } from "@pixi/ticker";
import { readRawMap } from "../atoms/map-reducer";
import { setTimeInputValue } from "../atoms/ref";
import { readUtilityParams, setIsTimeInputValid, setPlayingLineIndex, setTimeRangeValue } from "../atoms/state";
import { readYTPlayer } from "../atoms/youtube-player";

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
  const { directEditingIndex, playingLineIndex } = readUtilityParams();
  if (!directEditingIndex) {
    setTimeInputValue(currentTime.toFixed(3));
    setIsTimeInputValid(false);
  }

  const nextLineIndex = playingLineIndex + 1;

  const map = readRawMap();
  const nextLine = map[nextLineIndex];
  if (nextLine && Number(currentTime) >= Number(nextLine.time)) {
    setPlayingLineIndex(nextLineIndex);
  }
};

const editTicker = new Ticker();
editTicker.add(timer);

editTicker.maxFPS = 60;
