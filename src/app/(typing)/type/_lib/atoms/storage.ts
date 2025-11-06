import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { InputMode } from "../type";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const readyRadioInputModeAtom = atomWithStorage<InputMode>("inputMode", "roma", undefined, {
  getOnInit: false,
});
export const useReadyInputModeState = () => useAtomValue(readyRadioInputModeAtom, { store });
export const setReadyInputMode = (value: InputMode) => store.set(readyRadioInputModeAtom, value);
export const readReadyInputMode = () => store.get(readyRadioInputModeAtom);
