import { atom, useAtomValue } from "jotai";
import { mapReducerAtom } from "./map-reducer";
import { isTimeInputValidAtom, selectLineIndexAtom } from "./state";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const isNotSelectLineAtom = atom((get) => {
  const selectIndex = get(selectLineIndexAtom);

  return selectIndex === 0 || selectIndex === null;
});

const endLineIndexAtom = atom((get) => {
  const map = get(mapReducerAtom);

  return map.findLastIndex((line) => line.lyrics === "end");
});

const isLineLastSelectAtom = atom((get) => {
  const endLineIndex = get(endLineIndexAtom);
  const selectIndex = get(selectLineIndexAtom);

  if (selectIndex === null) {
    return false;
  }

  return selectIndex === endLineIndex;
});

const isAddButtonDisabledAtom = atom((get) => {
  const isTimeInputValid = get(isTimeInputValidAtom);
  return isTimeInputValid;
});

const isUpdateButtonDisabledAtom = atom((get) => {
  const isNotLineSelect = get(isNotSelectLineAtom);
  const isLineLastSelect = get(isLineLastSelectAtom);
  const isTimeInputValid = get(isTimeInputValidAtom);

  return isTimeInputValid || isNotLineSelect || isLineLastSelect;
});

const isDeleteButtonDisabledAtom = atom((get) => {
  const isNotSelectLine = get(isNotSelectLineAtom);
  const isSelectLastLine = get(isLineLastSelectAtom);

  return isNotSelectLine || isSelectLastLine;
});

export const useIsAddBtnDisabledState = () => useAtomValue(isAddButtonDisabledAtom, { store });
export const useIsUpdateBtnDisabledState = () => useAtomValue(isUpdateButtonDisabledAtom, { store });
export const useIsDeleteBtnDisabledState = () => useAtomValue(isDeleteButtonDisabledAtom, { store });

export const useEndLineIndexState = () => useAtomValue(endLineIndexAtom, { store });
export const readEndLineIndex = () => store.get(endLineIndexAtom);
