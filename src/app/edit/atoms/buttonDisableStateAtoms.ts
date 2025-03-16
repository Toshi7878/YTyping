import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { useStore as useReduxStore } from "react-redux";
import { RootState } from "../redux/store";
import { getEditAtomStore, isTimeInputValidAtom, selectIndexAtom } from "./stateAtoms";
const store = getEditAtomStore();

const editReduxStoreAtom = atom(() => useReduxStore<RootState>());

const isNotSelectLineAtom = atom((get) => {
  const selectIndex = get(selectIndexAtom);

  return selectIndex === 0 || selectIndex === null;
});

const isLineLastSelectAtom = atom((get) => {
  const mapData = get(editReduxStoreAtom).getState().mapData.value;
  const index = get(selectIndexAtom);
  const endAfterLineIndex =
    mapData.length -
    1 -
    mapData
      .slice()
      .reverse()
      .findIndex((line) => line.lyrics === "end");

  if (index === null) {
    return false;
  }

  return index === endAfterLineIndex;
});

const isAddButtonDisabledAtom = atom((get) => {
  const isTimeInputValid = get(isTimeInputValidAtom);
  return isTimeInputValid;
});

const isUpdateButtonDisabledAtom = atom((get) => {
  const isTimeInputValid = get(isTimeInputValidAtom);
  const isLineNotSelect = get(isNotSelectLineAtom);
  const isLineLastSelect = get(isLineLastSelectAtom);

  return isTimeInputValid || isLineNotSelect || isLineLastSelect;
});

const isDeleteButtonDisabledAtom = atom((get) => {
  const isNotSelectLine = get(isNotSelectLineAtom);
  const isSelectLastLine = get(isLineLastSelectAtom);

  return isNotSelectLine || isSelectLastLine;
});

export const useIsAddBtnDisabledState = () => useAtomValue(isAddButtonDisabledAtom, { store });
export const useIsAddBtnDisabledStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isAddButtonDisabledAtom), []),
    { store }
  );
};
export const useIsUpdateBtnDisabledState = () => useAtomValue(isUpdateButtonDisabledAtom, { store });
export const useIsUpdateBtnDisabledStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isUpdateButtonDisabledAtom), []),
    { store }
  );
};
export const useIsDeleteBtnDisabledState = () => useAtomValue(isDeleteButtonDisabledAtom, { store });
export const useIsDeleteBtnDisabledStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isDeleteButtonDisabledAtom), []),
    { store }
  );
};
