import { atomWithReset, RESET } from "jotai/utils";
import { getImeAtomStore } from "./store";

const store = getImeAtomStore();

export const mapIdAtom = atomWithReset<number | null>(null);
export const readMapId = () => store.get(mapIdAtom);
export const resetMapId = () => store.set(mapIdAtom, RESET);
