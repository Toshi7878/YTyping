import { RESET } from "jotai/utils";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  useLineStatus,
  usePlayer,
  useTypingDetails,
  useYTStatus,
} from "./refAtoms";
import { usePlaySpeedReducer } from "./speedReducerAtoms";
import {
  useClearLineResults,
  useReadMap,
  useResetPlayingState,
  useSetCurrentLine,
  useSetGameUtilParams,
  useSetMap,
  useSetTypingStatus,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const setGameUtils = useSetGameUtilParams();
  const readMap = useReadMap();

  const { resetTypingStatus } = useSetTypingStatus();
  const { resetGameUtilRefParams } = useGameUtilityReferenceParams();
  const { resetYTStatus } = useYTStatus();
  const { resetLineStatus } = useLineStatus();
  const { resetStatus } = useTypingDetails();
  const { writeCount } = useLineCount();
  const setMap = useSetMap();
  const { resetCurrentLine } = useSetCurrentLine();
  const { writePlayer } = usePlayer();
  const resetPlayingState = useResetPlayingState();
  const clearAllLineResults = useClearLineResults();
  return () => {
    writePlayer(null);
    resetCurrentLine();
    clearAllLineResults();
    setGameUtils(RESET);
    dispatchSpeed({ type: "reset" });
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
