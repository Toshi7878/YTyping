import { useSetEditTimeCountAtom } from "../edit-atom/editAtom";
import { useChangeLineRowColor } from "./useChangeLineRowColor";

export const useUpdateCurrentLine = () => {
  const setTimeCount = useSetEditTimeCountAtom();

  const { allUpdateCurrentTimeColor } = useChangeLineRowColor()
  return (newCount: number) => {
    setTimeCount(newCount);
    allUpdateCurrentTimeColor(newCount)
  };
};
