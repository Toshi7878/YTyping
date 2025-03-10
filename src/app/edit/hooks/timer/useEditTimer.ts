import { ThemeColors } from "@/types";
import { useTheme } from "@chakra-ui/react";
import { useStore as useJotaiStore } from "jotai";
import { useStore as useReduxStore } from "react-redux";
import { editDirectEditCountAtom, editTimeCountAtom } from "../../edit-atom/editAtom";
import { useRefs } from "../../edit-contexts/refsProvider";
import { RootState } from "../../redux/store";
import { useUpdateCurrentTimeLine } from "../useUpdateCurrentTimeLine";

export const useEditTimer = () => {
  const { playerRef, rangeRef, timeInputRef } = useRefs();
  const theme: ThemeColors = useTheme();
  const editAtomStore = useJotaiStore();
  const editReduxStore = useReduxStore<RootState>();

  const updateCurrentLine = useUpdateCurrentTimeLine();

  return () => {
    const currentTime = playerRef.current!.getCurrentTime().toFixed(3);

    rangeRef.current!.value = currentTime;
    const rangeMaxValue = rangeRef.current!.max;
    const progress = (Number(currentTime) / Number(rangeMaxValue)) * 100;

    rangeRef.current!.style.background = `linear-gradient(to right, ${theme.colors.primary.main} ${progress}%, ${theme.colors.text.body}30 ${progress}%)`;

    const isDirectEditing = editAtomStore.get(editDirectEditCountAtom);
    if (!isDirectEditing) {
      timeInputRef.current!.value = currentTime;
    }

    const count = editAtomStore.get(editTimeCountAtom);
    const nextCount = count + 1;

    const mapData = editReduxStore.getState().mapData.value;
    const nextLine = mapData[nextCount];
    if (nextLine && Number(currentTime) >= Number(nextLine["time"])) {
      updateCurrentLine(nextCount);
    }
  };
};
