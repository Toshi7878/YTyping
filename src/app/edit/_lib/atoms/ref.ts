import { atom } from "jotai";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const timeInputAtom = atom<HTMLInputElement | null>(null);
export const readTimeInputValue = () => {
  const timeInput = store.get(timeInputAtom);
  if (!timeInput) return;
  return timeInput.value;
};
export const setTimeInputValue = (value: string) => {
  const timeInput = store.get(timeInputAtom);
  if (!timeInput) return;
  timeInput.value = value;
};
export const writeTimeInput = (timeInput: HTMLInputElement) => store.set(timeInputAtom, timeInput);

const preventEditorTabAutoFocusAtom = atom(false);
export const preventEditortabAutoFocus = () => {
  setTimeout(() => store.set(preventEditorTabAutoFocusAtom, false));
  return store.get(preventEditorTabAutoFocusAtom);
};
export const setPreventEditorTabAutoFocus = (bool: boolean) => store.set(preventEditorTabAutoFocusAtom, bool);
