import { RESET } from "jotai/utils";
import { useHistoryReducer } from "./historyReducerAtom";
import { useMapReducer } from "./mapReducerAtom";
import {
  useLineReducer,
  useSetEditUtilsState,
  useSetYtPlayerStatusState,
  useSetYTSpeedState,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const setEditUtils = useSetEditUtilsState();

  const setYTSpeed = useSetYTSpeedState();
  const setYtPlayerStatus = useSetYtPlayerStatusState();

  const mapDispatch = useMapReducer();
  const setSelectLine = useLineReducer();
  const historyDispatch = useHistoryReducer();

  return () => {
    setEditUtils(RESET);
    setYTSpeed(1);
    setYtPlayerStatus((prev) => ({
      ...prev,
      playing: false,
      readied: false,
      started: false,
    }));
    mapDispatch({ type: "reset" });
    setSelectLine({ type: "reset" });
    historyDispatch({ type: "reset" });
  };
};
