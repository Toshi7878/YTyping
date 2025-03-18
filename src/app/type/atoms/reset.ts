import { RESET } from "jotai/utils";
import { usePlaySpeedReducer } from "./reducerAtoms";
import { useGameUtilsRef, useLineStatusRef, useStatusRef, useYTStatusRef } from "./refAtoms";
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
  const { resetYTStatusRef } = useYTStatusRef();
  const { resetLineStatusRef } = useLineStatusRef();
  const { resetStatusRef } = useStatusRef();
  const setMap = useSetMapState();

  return () => {
    setLineResults(RESET);
    setGameUtils(RESET);
    dispatchSpeed({ type: "reset" });
    setMap(RESET);
    resetTypingStatus();
    resetGameUtils();
    resetYTStatusRef();
    resetStatusRef();
    resetLineStatusRef();
  };
};
