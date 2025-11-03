import { RESET } from "jotai/utils";
import { resetLineCount, resetLineSubstatus, resetSubstatus, resetUtilityRefParams, resetYTPlayer } from "./read-atoms";
import { useSetSpeed as useSetPlaySpeed } from "./speed-reducer-atoms";
import {
  clearAllLineResult,
  resetCurrentLine,
  resetSubstatusState,
  resetTypingStatus,
  resetUtilityParams,
  useSetBuiltMap,
} from "./state-atoms";

export const usePathChangeAtomReset = () => {
  const setPlaySpeed = useSetPlaySpeed();

  const setMap = useSetBuiltMap();
  return () => {
    resetYTPlayer();
    resetCurrentLine();
    clearAllLineResult();
    resetUtilityParams();
    setPlaySpeed(RESET);
    setMap(RESET);
    resetTypingStatus();
    resetUtilityRefParams();
    resetSubstatusState();
    resetSubstatus();

    resetLineSubstatus();
    resetLineCount();
  };
};
