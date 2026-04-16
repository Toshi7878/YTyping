import { useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { store } from "./store";

export const mapIdAtom = atomWithReset<number | null>(null);
export const useMapIdState = () => useAtomValue(mapIdAtom);
export const readMapId = () => store.get(mapIdAtom);
