import { RESET } from "jotai/utils";
import { useGameUtilsRef, useLineStatusRef, useStatusRef, useYTStatusRef } from "./refAtoms";
import {
  useSetGameUtilsState,
  useSetLineResultsState,
  useSetMapState,
  useSetPlaySpeedState,
  useSetTypingStatusState,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const setPlaySpeed = useSetPlaySpeedState();
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
    setPlaySpeed(RESET);
    setMap(RESET);
    resetTypingStatus();
    resetGameUtils();
    resetYTStatusRef();
    resetStatusRef();
    resetLineStatusRef();
  };
};
