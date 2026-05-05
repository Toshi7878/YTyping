import { getDefaultStore, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

const store = getDefaultStore();

const volumeAtom = atomWithStorage("volume", 30, undefined, { getOnInit: true });

export const useVolume = () => useAtomValue(volumeAtom, { store });
export const getVolume = () => store.get(volumeAtom);
export const setVolume = (value: number) => store.set(volumeAtom, value);
