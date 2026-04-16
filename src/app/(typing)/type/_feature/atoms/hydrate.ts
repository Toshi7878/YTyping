import { useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { getTypingGameAtomStore } from "./store";

const store = getTypingGameAtomStore();

export const mapIdAtom = atomWithReset<number | null>(null);
export const useMapIdState = () => useAtomValue(mapIdAtom, { store });
export const readMapId = () => store.get(mapIdAtom);
