import { ThemeColors } from "@/types";
import { useTheme } from "@chakra-ui/react";
import { useStore as useReduxStore } from "react-redux";
import { usePlayer, useTimeInput, useTimeRange } from "../../atoms/refAtoms";
import { useEditUtilsStateRef } from "../../atoms/stateAtoms";
import { RootState } from "../../redux/store";
import { useUpdateCurrentTimeLine } from "../useUpdateCurrentTimeLine";

export const useTimer = () => {
  const theme: ThemeColors = useTheme();
  const editReduxStore = useReduxStore<RootState>();

  const updateCurrentLine = useUpdateCurrentTimeLine();
  const readEditUtils = useEditUtilsStateRef();

  const { readTimeInput } = useTimeInput();
  const { readPlayer } = usePlayer();
  const { readTimeRange } = useTimeRange();

  return () => {
    const currentTime = readPlayer().getCurrentTime().toFixed(3);

    readTimeRange().value = currentTime;
    const rangeMaxValue = readTimeRange().max;
    const progress = (Number(currentTime) / Number(rangeMaxValue)) * 100;

    readTimeRange().style.background = `linear-gradient(to right, ${theme.colors.primary.main} ${progress}%, ${theme.colors.text.body}30 ${progress}%)`;

    const { directEditingIndex, timeCount } = readEditUtils();
    if (!directEditingIndex) {
      readTimeInput().value = currentTime;
    }

    const nextCount = timeCount + 1;

    const mapData = editReduxStore.getState().mapData.value;
    const nextLine = mapData[nextCount];
    if (nextLine && Number(currentTime) >= Number(nextLine["time"])) {
      updateCurrentLine(nextCount);
    }
  };
};
