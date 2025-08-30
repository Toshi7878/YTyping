import { Ticker } from "@pixi/ticker";
import { useReadMap } from "../atoms/mapReducerAtom";
import { usePlayer, useTimeInput } from "../atoms/refAtoms";
import { useReadEditUtils, useSetIsTimeInputValid, useSetTimeCount, useSetTimeRangeValue } from "../atoms/stateAtoms";

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
  const readMap = useReadMap();
  const setTimeRangeValue = useSetTimeRangeValue();

  return () => {
    const currentTime = Number(readPlayer().getCurrentTime().toFixed(3));

    setTimeRangeValue(currentTime);

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
