import { RESET } from "jotai/utils";
import { resetLineCount, resetLineSubstatus, resetUtilityRefParams, resetYTPlayer } from "./read-atoms";
import { useSetSpeed as useSetPlaySpeed } from "./speed-reducer-atoms";
import {
  useClearLineResults,
  useResetGameUtilityParams,
  useResetSubstatus,
  useSetCombo,
  useSetCurrentLine,
  useSetMap,
  useSetTypingStatus,
} from "./state-atoms";

export const usePathChangeAtomReset = () => {
  const resetGameUtilityParams = useResetGameUtilityParams();
  const setPlaySpeed = useSetPlaySpeed();

  const { resetTypingStatus } = useSetTypingStatus();
  const setMap = useSetMap();
  const { resetCurrentLine } = useSetCurrentLine();
  const resetSubstatus = useResetSubstatus();
  const clearAllLineResults = useClearLineResults();
  const setCombo = useSetCombo();
  return () => {
    setCombo(0);
    resetYTPlayer();
    resetCurrentLine();
    clearAllLineResults();
    resetGameUtilityParams();
    setPlaySpeed(RESET);
    setMap(RESET);
    resetTypingStatus();
    resetUtilityRefParams();
    resetSubstatus();
    resetSubstatus();

    resetLineSubstatus();
    resetLineCount();
  };
};
