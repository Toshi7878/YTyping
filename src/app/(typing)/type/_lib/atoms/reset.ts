import { RESET } from "jotai/utils";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  useLineStatus,
  usePlayer,
  useTypingSubstatusReference,
} from "./read-atoms";
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
  const { resetGameUtilRefParams } = useGameUtilityReferenceParams();
  const { resetLineStatus } = useLineStatus();
  const { resetStatus } = useTypingSubstatusReference();
  const { writeCount } = useLineCount();
  const setMap = useSetMap();
  const { resetCurrentLine } = useSetCurrentLine();
  const { writePlayer } = usePlayer();
  const resetSubstatus = useResetSubstatus();
  const clearAllLineResults = useClearLineResults();
  const setCombo = useSetCombo();
  return () => {
    setCombo(0);
    writePlayer(null);
    resetCurrentLine();
    clearAllLineResults();
    resetGameUtilityParams();
    setPlaySpeed(RESET);
    setMap(RESET);
    resetTypingStatus();
    resetGameUtilRefParams();
    resetStatus();
    resetSubstatus();

    resetLineStatus();
    writeCount(0);
  };
};
