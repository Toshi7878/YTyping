import { RESET } from "jotai/utils";
import { useDispatch } from "react-redux";
import { resetUndoRedoData } from "../redux/undoredoSlice";
import {
  useSetEditUtilsState,
  useSetMapInfoState,
  useSetSelectLineState,
  useSetYtPlayerStatusState,
} from "./stateAtoms";

export const usePathChangeAtomReset = () => {
  const dispatch = useDispatch();
  const setEditUtils = useSetEditUtilsState();
  const setYtPlayerStatus = useSetYtPlayerStatusState();
  const setMapInfo = useSetMapInfoState();
  const setSelectLine = useSetSelectLineState();
  return () => {
    setEditUtils(RESET);
    setYtPlayerStatus(RESET);
    setMapInfo(RESET);
    setSelectLine(RESET);
    dispatch(resetUndoRedoData());
  };
};
