import { ThemeColors } from "@/types";
import { useTheme } from "@chakra-ui/react";
import { useStore as useReduxStore } from "react-redux";
import { useTimeInput } from "../../atoms/refAtoms";
import { useEditUtilsStateRef } from "../../atoms/stateAtoms";
import { useRefs } from "../../edit-contexts/refsProvider";
import { RootState } from "../../redux/store";
import { useUpdateCurrentTimeLine } from "../useUpdateCurrentTimeLine";

export const useTimer = () => {
  const { playerRef, rangeRef } = useRefs();
  const theme: ThemeColors = useTheme();
  const editReduxStore = useReduxStore<RootState>();

  const updateCurrentLine = useUpdateCurrentTimeLine();
  const readEditUtils = useEditUtilsStateRef();

  const { readTimeInput } = useTimeInput();
  return () => {
    const currentTime = playerRef.current!.getCurrentTime().toFixed(3);

    rangeRef.current!.value = currentTime;
    const rangeMaxValue = rangeRef.current!.max;
    const progress = (Number(currentTime) / Number(rangeMaxValue)) * 100;

    rangeRef.current!.style.background = `linear-gradient(to right, ${theme.colors.primary.main} ${progress}%, ${theme.colors.text.body}30 ${progress}%)`;

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
