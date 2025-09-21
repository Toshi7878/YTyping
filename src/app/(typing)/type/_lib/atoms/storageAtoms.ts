import { useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import type { InputMode } from "../type";
import { getTypeAtomStore } from "./store";
const store = getTypeAtomStore();

const readyRadioInputModeAtom = atomWithStorage<InputMode>("inputMode", "roma", undefined, {
  getOnInit: true,
});
export const useReadyInputModeState = () => useAtomValue(readyRadioInputModeAtom, { store });
export const useSetReadyInputMode = () => useSetAtom(readyRadioInputModeAtom, { store });
export const useReadReadyInputMode = () => {
  return useAtomCallback(
    useCallback((get) => get(readyRadioInputModeAtom), []),
    { store },
  );
};
