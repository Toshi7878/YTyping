import { getDefaultStore, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { InputMode } from "lyrics-typing-engine";

const store = getDefaultStore();

const readyRadioInputModeAtom = atomWithStorage<InputMode>("inputMode", "roma");
export const useReadyInputMode = () => useAtomValue(readyRadioInputModeAtom, { store });
export const setReadyInputMode = (value: InputMode) => store.set(readyRadioInputModeAtom, value);
export const getReadyInputMode = () => store.get(readyRadioInputModeAtom);
