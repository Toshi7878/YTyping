import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { DIFFICULTY_RANGE } from "../ts/consts";

const store = createStore();
export const getHomeAtomStore = () => store;

export const difficultyRangeAtom = atomWithReset(DIFFICULTY_RANGE);
export const useDifficultyRangeState = () => useAtomValue(difficultyRangeAtom, { store: store });
export const useSetDifficultyRangeState = () => useSetAtom(difficultyRangeAtom, { store: store });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store: store });
export const useSetIsSearchingState = () => useSetAtom(isSearchingAtom, { store: store });

const mapListLengthAtom = atom(0);
export const useMapListLengthState = () => useAtomValue(mapListLengthAtom, { store: store });
export const useSetMapListLengthState = () => useSetAtom(mapListLengthAtom, { store: store });
