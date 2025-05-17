import { RESET } from "jotai/utils";
import { useLineCount, useLyricsTextarea } from "../atom/refAtoms";
import {
  useSetDisplayLines,
  useSetJudgedWords,
  useSetNextDisplayLine,
  useSetNotifications,
  useSetScene,
  useSetStatus,
} from "../atom/stateAtoms";

export const useInitializePlayScene = () => {
  const setDisplayLines = useSetDisplayLines();
  const setNextDisplayLine = useSetNextDisplayLine();
  const setStatus = useSetStatus();
  const setJudgedWords = useSetJudgedWords();
  const setNotifications = useSetNotifications();
  const setScene = useSetScene();
  const { writeCount } = useLineCount();
  const { readLyricsTextarea } = useLyricsTextarea();

  return () => {
    setDisplayLines(RESET);
    setNextDisplayLine([]);
    setStatus(RESET);
    setJudgedWords(RESET);
    setNotifications(RESET);
    writeCount(0);
    readLyricsTextarea().focus();

    setScene("play");
  };
};
