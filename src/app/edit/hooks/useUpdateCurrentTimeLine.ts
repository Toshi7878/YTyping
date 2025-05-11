import { useSetTimeCount } from "../atoms/stateAtoms";
import { useChangeLineRowColor } from "./utils/useChangeLineRowColor";

export const useUpdateCurrentTimeLine = () => {
  const setTimeCount = useSetTimeCount();

  const { allUpdateCurrentTimeColor } = useChangeLineRowColor();
  return (newCount: number) => {
    setTimeCount(newCount);
    allUpdateCurrentTimeColor(newCount);
  };
};
