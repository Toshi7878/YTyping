import { RESET } from "jotai/utils";
import { useHistoryReducer } from "./history-reducer-atom";
import { useMapReducer } from "./map-reducer-atom";
import { useLineReducer, useSetEditUtils, useSetYtPlayerStatus, useSetYTSpeed } from "./state-atoms";

export const usePathChangeAtomReset = () => {
  const setEditUtils = useSetEditUtils();

  const setYTSpeed = useSetYTSpeed();
  const setYtPlayerStatus = useSetYtPlayerStatus();

  const mapDispatch = useMapReducer();
  const setSelectLine = useLineReducer();
  const historyDispatch = useHistoryReducer();

  return () => {
    setEditUtils(RESET);
    setYTSpeed(1);
    setYtPlayerStatus(RESET);
    mapDispatch({ type: "reset" });
    setSelectLine({ type: "reset" });
    historyDispatch({ type: "reset" });
  };
};
