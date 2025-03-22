import { RESET } from "jotai/utils";
import {
  useLineReducer,
  useSetEditUtilsState,
  useSetMapInfoState,
  useSetYtPlayerStatusState,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const setEditUtils = useSetEditUtilsState();
  const setYtPlayerStatus = useSetYtPlayerStatusState();
  const setMapInfo = useSetMapInfoState();
  const setSelectLine = useLineReducer();
  return () => {
    setEditUtils(RESET);
    setYtPlayerStatus(RESET);
    setMapInfo(RESET);
    setSelectLine({ type: "reset" });
    // dispatch(resetUndoRedoData());
  };
};
