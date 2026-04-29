import { atomWithReset, RESET } from "jotai/utils";
import { store } from "../../_feature/provider";

export const mapIdAtom = atomWithReset<number | null>(null);
export const readMapId = () => store.get(mapIdAtom);
export const resetMapId = () => store.set(mapIdAtom, RESET);
