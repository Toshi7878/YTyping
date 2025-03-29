import { RESET } from "jotai/utils";
import { useCountRef, useGameUtilsRef, useLineStatusRef, useStatusRef, useYTStatusRef } from "./refAtoms";
import { usePlaySpeedReducer } from "./speedReducerAtoms";
import {
  useSetCurrentLineState,
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
  const { writeCount } = useCountRef();
  const setMap = useSetMapState();
  const { resetCurrentLine } = useSetCurrentLineState();

  return () => {
    resetCurrentLine();
    setLineResults(RESET);
    setGameUtils(RESET);
    setMap(RESET);
    resetTypingStatus();
    resetGameUtils();
    resetYTStatus();
    resetStatus();
    resetLineStatus();
    writeCount(0);
  };
};
