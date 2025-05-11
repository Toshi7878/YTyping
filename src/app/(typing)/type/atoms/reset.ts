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
  useSetCurrentLine,
  useSetGameUtilParams,
  useSetLineResults,
  useSetMap,
  useSetTypingStatus,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const setLineResults = useSetLineResults();
  const setGameUtils = useSetGameUtilParams();

  const { resetTypingStatus } = useSetTypingStatus();
  const { resetGameUtilRefParams } = useGameUtilityReferenceParams();
  const { resetYTStatus } = useYTStatus();
  const { resetLineStatus } = useLineStatus();
  const { resetStatus } = useTypingDetails();
  const { writeCount } = useLineCount();
  const setMap = useSetMap();
  const { resetCurrentLine } = useSetCurrentLine();
  const { writePlayer } = usePlayer();

  return () => {
    writePlayer(null);
    resetCurrentLine();
    setLineResults(RESET);
    setGameUtils(RESET);
    dispatchSpeed({ type: "reset" });
    setMap(RESET);
    resetTypingStatus();
    resetGameUtilRefParams();
    resetYTStatus();
    resetStatus();
    resetLineStatus();
    writeCount(0);
  };
};
