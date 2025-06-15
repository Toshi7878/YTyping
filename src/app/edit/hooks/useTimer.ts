import { Ticker } from "pixi.js";
import { useReadMap } from "../atoms/mapReducerAtom";
import { usePlayer, useTimeInput, useTimeRange } from "../atoms/refAtoms";
import { useReadEditUtils, useSetIsTimeInputValid, useSetTimeCount } from "../atoms/stateAtoms";

const editTicker = new Ticker();

export const useTimerRegistration = () => {
  const editTimer = useTimer();

  const addTimer = () => {
    editTicker.add(editTimer);
  };

  const removeTimer = () => {
    editTicker.stop();
    editTicker.remove(editTimer);
  };

  return { addTimer, removeTimer };
};
export const useTimerControls = () => {
  const setIsTimeInputValid = useSetIsTimeInputValid();

  const startTimer = () => {
    if (!editTicker.started) {
      editTicker.start();
      setIsTimeInputValid(false);
    }
  };

  const pauseTimer = () => {
    if (editTicker.started) {
      editTicker.stop();
    }
  };

  return { startTimer, pauseTimer };
};

const useTimer = () => {
  const setTimeCount = useSetTimeCount();
  const readEditUtils = useReadEditUtils();

  const { setTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const { readTimeRange } = useTimeRange();
  const readMap = useReadMap();

  return () => {
    const currentTime = readPlayer().getCurrentTime().toFixed(3);

    readTimeRange().value = currentTime;
    const rangeMaxValue = readTimeRange().max;
    const progress = (Number(currentTime) / Number(rangeMaxValue)) * 100;

    // Using CSS variables from the theme instead of Chakra UI theme
    readTimeRange().style.background = `linear-gradient(to right, hsl(var(--primary)) ${progress}%, hsl(var(--muted-foreground)) ${progress}%)`;

    const { directEditingIndex, timeCount } = readEditUtils();
    if (!directEditingIndex) {
      setTime(currentTime);
    }

    const nextCount = timeCount + 1;

    const map = readMap();
    const nextLine = map[nextCount];
    if (nextLine && Number(currentTime) >= Number(nextLine["time"])) {
      setTimeCount(nextCount);
    }
  };
};
