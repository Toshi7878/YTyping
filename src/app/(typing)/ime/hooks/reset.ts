import { RESET } from "jotai/utils";
import { useLyricsTextarea } from "../atom/refAtoms";
import { useSetNextDisplayLine, useSetNotifications, useSetScene, useSetStatus } from "../atom/stateAtoms";

export const useInitializePlayScene = () => {
  const setNextDisplayLine = useSetNextDisplayLine();
  const setStatus = useSetStatus();
  const setNotifications = useSetNotifications();
  const setScene = useSetScene();
  const { readLyricsTextarea } = useLyricsTextarea();

  return () => {
    setNextDisplayLine([]);
    setStatus(RESET);
    setNotifications(RESET);
    readLyricsTextarea().focus();

    setScene("play");
  };
};
