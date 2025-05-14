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
import { useSetGameUtilParams, useSetMap } from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const setGameUtils = useSetGameUtilParams();

  const { resetGameUtilRefParams } = useGameUtilityReferenceParams();
  const { resetYTStatus } = useYTStatus();
  const { resetLineStatus } = useLineStatus();
  const { resetStatus } = useTypingDetails();
  const { writeCount } = useLineCount();
  const setMap = useSetMap();
  const { writePlayer } = usePlayer();

  return () => {
    writePlayer(null);
    setGameUtils(RESET);
    dispatchSpeed({ type: "reset" });
    setMap(RESET);
    resetGameUtilRefParams();
    resetYTStatus();
    resetStatus();
    resetLineStatus();
    writeCount(0);
  };
};
