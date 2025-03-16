import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { DIFFICULTY_RANGE } from "../ts/consts";

const homeAtomStore = createStore();
export const getHomeAtomStore = () => homeAtomStore;

export const difficultyRangeAtom = atomWithReset(DIFFICULTY_RANGE);
export const useDifficultyRangeAtom = () => useAtomValue(difficultyRangeAtom, { store: homeAtomStore });
export const useSetDifficultyRangeAtom = () => useSetAtom(difficultyRangeAtom, { store: homeAtomStore });

const isSearchingAtom = atom(false);
export const useIsSearchingAtom = () => useAtomValue(isSearchingAtom, { store: homeAtomStore });
export const useSetIsSearchingAtom = () => useSetAtom(isSearchingAtom, { store: homeAtomStore });
