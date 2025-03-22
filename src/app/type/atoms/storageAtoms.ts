import { useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputMode } from "../ts/type";
import { getTypeAtomStore } from "./store";
const store = getTypeAtomStore();

const readyRadioInputModeAtom = atomWithStorage<InputMode>("inputMode", "roma", undefined, {
  getOnInit: true,
});
export const useReadyInputModeState = () => useAtomValue(readyRadioInputModeAtom, { store });
export const useSetReadyInputModeState = () => useSetAtom(readyRadioInputModeAtom, { store });
export const useReadyInputModeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(readyRadioInputModeAtom), []),
    { store }
  );
};
