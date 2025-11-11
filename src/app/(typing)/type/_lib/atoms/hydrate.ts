import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";
import { writeUtilityRefParams } from "./ref";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

export const mapIdAtom = atomWithReset<number | null>(null);
export const useMapIdState = () => useAtomValue(mapIdAtom, { store });
export const readMapId = () => store.get(mapIdAtom);
export const setMapId = (value: ExtractAtomValue<typeof mapIdAtom>) => store.set(mapIdAtom, value);

export const typingOptionsAtom = atomWithReset(DEFAULT_TYPING_OPTIONS);
export const useTypingOptionsState = () => useAtomValue(typingOptionsAtom, { store });
export const readTypingOptions = () => store.get(typingOptionsAtom);
export const setTypingOptions = (newTypingOptions: Partial<ExtractAtomValue<typeof typingOptionsAtom>>) => {
  store.set(typingOptionsAtom, (prev) => ({ ...prev, ...newTypingOptions }));
  writeUtilityRefParams({ isOptionEdited: true });
};
export const resetTypingOptions = () => {
  store.set(typingOptionsAtom, RESET);
  writeUtilityRefParams({ isOptionEdited: true });
};
