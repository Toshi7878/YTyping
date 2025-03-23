import { ThemeColors } from "@/types";
import { useTheme } from "@chakra-ui/react";
import { Ticker } from "pixi.js";
import { useMapStateRef } from "../atoms/mapReducerAtom";
import { usePlayer, useTimeInput, useTimeRange } from "../atoms/refAtoms";
import { useEditUtilsStateRef, useSetIsTimeInputValidState } from "../atoms/stateAtoms";
import { useUpdateCurrentTimeLine } from "./useUpdateCurrentTimeLine";

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
  const setIsTimeInputValid = useSetIsTimeInputValidState();

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
  const theme: ThemeColors = useTheme();

  const updateCurrentLine = useUpdateCurrentTimeLine();
  const readEditUtils = useEditUtilsStateRef();

  const { setTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const { readTimeRange } = useTimeRange();
  const readMap = useMapStateRef();

  return () => {
    const currentTime = readPlayer().getCurrentTime().toFixed(3);

    readTimeRange().value = currentTime;
    const rangeMaxValue = readTimeRange().max;
    const progress = (Number(currentTime) / Number(rangeMaxValue)) * 100;

    readTimeRange().style.background = `linear-gradient(to right, ${theme.colors.primary.main} ${progress}%, ${theme.colors.text.body}30 ${progress}%)`;

    const { directEditingIndex, timeCount } = readEditUtils();
    if (!directEditingIndex) {
      setTime(currentTime);
    }

    const nextCount = timeCount + 1;

    const map = readMap();
    const nextLine = map[nextCount];
    if (nextLine && Number(currentTime) >= Number(nextLine["time"])) {
      updateCurrentLine(nextCount);
    }
  };
};
