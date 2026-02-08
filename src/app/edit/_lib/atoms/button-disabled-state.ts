import { atom, useAtomValue } from "jotai";
import { mapAtom } from "./map-reducer";
import { isTimeInputValidAtom, selectLineIndexAtom } from "./state";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const isUnselectLineAtom = atom((get) => {
  const selectIndex = get(selectLineIndexAtom);
  return selectIndex === null;
});

const isSelectFirstLineAtom = atom((get) => {
  const selectIndex = get(selectLineIndexAtom);
  return selectIndex === 0;
});

const isSelectEndLineAtom = atom((get) => {
  const endLineIndex = get(endLineIndexAtom);
  const selectIndex = get(selectLineIndexAtom);

  return selectIndex === endLineIndex;
});

const endLineIndexAtom = atom((get) => {
  const map = get(mapAtom);
  return map.findLastIndex((line) => line.lyrics === "end");
});

const isAddButtonDisabledAtom = atom((get) => {
  const isTimeInputValid = get(isTimeInputValidAtom);
  return isTimeInputValid;
});

const isUpdateButtonDisabledAtom = atom((get) => {
  const isUnselectLine = get(isUnselectLineAtom);
  const isSelectFirstLine = get(isSelectFirstLineAtom)
  const isSelectEndLine = get(isSelectEndLineAtom);
  const isTimeInputValid = get(isTimeInputValidAtom);

  return isTimeInputValid || isUnselectLine || isSelectEndLine || isSelectFirstLine;
});

const isDeleteButtonDisabledAtom = atom((get) => {
  const isNotSelectLine = get(isUnselectLineAtom);
  const isSelectLastLine = get(isSelectEndLineAtom);

  return isNotSelectLine || isSelectLastLine;
});

export const useIsAddBtnDisabledState = () => useAtomValue(isAddButtonDisabledAtom, { store });
export const useIsUpdateBtnDisabledState = () => useAtomValue(isUpdateButtonDisabledAtom, { store });
export const useIsDeleteBtnDisabledState = () => useAtomValue(isDeleteButtonDisabledAtom, { store });

export const useEndLineIndexState = () => useAtomValue(endLineIndexAtom, { store });
export const readEndLineIndex = () => store.get(endLineIndexAtom);
