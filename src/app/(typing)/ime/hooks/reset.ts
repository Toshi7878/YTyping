import { RESET } from "jotai/utils";
import { useLyricsTextarea, usePlayer } from "../atom/refAtoms";
import { usePlaySpeedReducer } from "../atom/speedReducerAtoms";
import {
  useResetGameUtilParams,
  useSetMap,
  useSetNextDisplayLine,
  useSetNotifications,
  useSetScene,
  useSetStatus,
} from "../atom/stateAtoms";

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

export const usePathChangeAtomReset = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const resetGameUtils = useResetGameUtilParams();
  const setScene = useSetScene();
  const setMap = useSetMap();
  const { writePlayer } = usePlayer();
  const setNextDisplayLine = useSetNextDisplayLine();
  const setStatus = useSetStatus();
  const setNotifications = useSetNotifications();

  return () => {
    resetGameUtils();
    writePlayer(null);
    dispatchSpeed({ type: "reset" });
    setMap(RESET);
    setScene(RESET);
    setNextDisplayLine([]);
    setStatus(RESET);
    setNotifications(RESET);
  };
};
