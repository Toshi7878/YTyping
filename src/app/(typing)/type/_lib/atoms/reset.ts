import { RESET } from "jotai/utils";
import { clearAllLineResult } from "./family";
import { resetLineCount, resetLineSubstatus, resetSubstatus, resetUtilityRefParams, resetYTPlayer } from "./ref";
import { useSetSpeed as useSetPlaySpeed } from "./speed-reducer";
import { resetCurrentLine, resetSubstatusState, resetTypingStatus, resetUtilityParams, useSetBuiltMap } from "./state";

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
