import { RESET } from "jotai/utils";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  useLineStatus,
  usePlayer,
  useReadYTStatus,
  useTypingDetails,
} from "./ref-atoms";
import { useSetSpeed as useSetPlaySpeed } from "./speed-reducer-atoms";
import {
  useClearLineResults,
  useResetPlayingState,
  useSetCombo,
  useSetCurrentLine,
  useSetGameUtilParams,
  useSetMap,
  useSetTypingStatus,
} from "./state-atoms";

export const usePathChangeAtomReset = () => {
  const setGameUtils = useSetGameUtilParams();
  const setPlaySpeed = useSetPlaySpeed();

  const { resetTypingStatus } = useSetTypingStatus();
  const { resetGameUtilRefParams } = useGameUtilityReferenceParams();
  const { resetYTStatus } = useReadYTStatus();
  const { resetLineStatus } = useLineStatus();
  const { resetStatus } = useTypingDetails();
  const { writeCount } = useLineCount();
  const setMap = useSetMap();
  const { resetCurrentLine } = useSetCurrentLine();
  const { writePlayer } = usePlayer();
  const resetPlayingState = useResetPlayingState();
  const clearAllLineResults = useClearLineResults();
  const setCombo = useSetCombo();
  return () => {
    setCombo(0);
    writePlayer(null);
    resetCurrentLine();
    clearAllLineResults();
    setGameUtils(RESET);
    setPlaySpeed(RESET);
    setMap(RESET);
    resetTypingStatus();
    resetGameUtilRefParams();
    resetYTStatus();
    resetStatus();
    resetPlayingState();

    resetLineStatus();
    writeCount(0);
  };
};
