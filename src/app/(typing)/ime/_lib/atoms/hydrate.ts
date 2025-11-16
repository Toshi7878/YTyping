import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { getImeAtomStore } from "./store";

const store = getImeAtomStore();

export const mapIdAtom = atomWithReset<number | null>(null);
export const useMapIdState = () => useAtomValue(mapIdAtom, { store });
export const readMapId = () => store.get(mapIdAtom);
export const setMapId = (value: ExtractAtomValue<typeof mapIdAtom>) => store.set(mapIdAtom, value);
export const resetMapId = () => store.set(mapIdAtom, RESET);
