import { RESET } from "jotai/utils";
import { useLineCount, usePlayer } from "./refAtoms";
import { usePlaySpeedReducer } from "./speedReducerAtoms";
import {
  useSetDisplayLines,
  useSetGameUtilParams,
  useSetJudgedWords,
  useSetMap,
  useSetNextDisplayLine,
  useSetNotifications,
  useSetStatus,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const setGameUtils = useSetGameUtilParams();

  const setMap = useSetMap();
  const { writePlayer } = usePlayer();
  const setDisplayLines = useSetDisplayLines();
  const setNextDisplayLine = useSetNextDisplayLine();
  const setStatus = useSetStatus();
  const setJudgedWords = useSetJudgedWords();
  const setNotifications = useSetNotifications();
  const { writeCount } = useLineCount();

  return () => {
    writePlayer(null);
    setGameUtils(RESET);
    dispatchSpeed({ type: "reset" });
    setMap(RESET);
    setDisplayLines(RESET);
    setNextDisplayLine([]);
    setStatus(RESET);
    setJudgedWords(RESET);
    setNotifications(RESET);
    writeCount(0);
  };
};
