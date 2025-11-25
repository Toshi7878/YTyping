import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

export const mapIdAtom = atomWithReset<number | null>(null);
export const useMapIdState = () => useAtomValue(mapIdAtom, { store });
export const readMapId = () => store.get(mapIdAtom);
export const setMapId = (value: ExtractAtomValue<typeof mapIdAtom>) => store.set(mapIdAtom, value);

export const creatorIdAtom = atomWithReset<number | null>(null);
export const useCreatorIdState = () => useAtomValue(creatorIdAtom, { store });
export const setCreatorId = (value: ExtractAtomValue<typeof creatorIdAtom>) => store.set(creatorIdAtom, value);

export const videoIdAtom = atomWithReset("");
export const useVideoIdState = () => useAtomValue(videoIdAtom, { store });
export const readVideoId = () => store.get(videoIdAtom);
export const setVideoId = (value: ExtractAtomValue<typeof videoIdAtom>) => store.set(videoIdAtom, value);
