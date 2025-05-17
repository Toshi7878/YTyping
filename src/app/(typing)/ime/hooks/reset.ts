import { RESET } from "jotai/utils";
import { useLineCount } from "../atom/refAtoms";
import {
  useSetDisplayLines,
  useSetJudgedWords,
  useSetNextLyrics,
  useSetNotifications,
  useSetScene,
  useSetStatus,
} from "../atom/stateAtoms";

export const useRetry = () => {
  const setDisplayLines = useSetDisplayLines();
  const setNextLyrics = useSetNextLyrics();
  const setStatus = useSetStatus();
  const setJudgedWords = useSetJudgedWords();
  const setNotifications = useSetNotifications();
  const setScene = useSetScene();
  const { writeCount } = useLineCount();
  return () => {
    setDisplayLines(RESET);
    setNextLyrics(RESET);
    setStatus(RESET);
    setJudgedWords(RESET);
    setNotifications(RESET);
    writeCount(0);
    setScene("play");
  };
};
