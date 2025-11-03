import { useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { InputMode } from "../type";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const readyRadioInputModeAtom = atomWithStorage<InputMode>("inputMode", "roma", undefined, {
  getOnInit: true,
});
export const useReadyInputModeState = () => useAtomValue(readyRadioInputModeAtom, { store });
export const useSetReadyInputMode = () => useSetAtom(readyRadioInputModeAtom, { store });
export const readReadyInputMode = () => store.get(readyRadioInputModeAtom);
