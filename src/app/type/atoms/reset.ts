import { RESET } from "jotai/utils";
import { useGameUtilsRef, useLineStatusRef, useStatusRef, useYTStatusRef } from "./refAtoms";
import { usePlaySpeedReducer } from "./speedReducerAtoms";
import {
  useSetGameUtilsState,
  useSetLineResultsState,
  useSetMapState,
  useSetTypingStatusState,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const setLineResults = useSetLineResultsState();
  const setGameUtils = useSetGameUtilsState();

  const { resetTypingStatus } = useSetTypingStatusState();
  const { resetGameUtils } = useGameUtilsRef();
  const { resetYTStatus } = useYTStatusRef();
  const { resetLineStatus } = useLineStatusRef();
  const { resetStatus } = useStatusRef();
  const setMap = useSetMapState();

  return () => {
    setLineResults(RESET);
    setGameUtils(RESET);
    dispatchSpeed({ type: "reset" });
    setMap(RESET);
    resetTypingStatus();
    resetGameUtils();
    resetYTStatus();
    resetStatus();
    resetLineStatus();
  };
};
