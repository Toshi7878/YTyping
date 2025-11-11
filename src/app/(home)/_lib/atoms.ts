import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { MAP_DIFFICULTY_RATE_FILTER_LIMIT } from "@/validator/map";

const store = createStore();
export const getHomeAtomStore = () => store;

export const pendingDifficultyRangeAtom = atomWithReset({
  minRate: MAP_DIFFICULTY_RATE_FILTER_LIMIT.min,
  maxRate: MAP_DIFFICULTY_RATE_FILTER_LIMIT.max,
});
export const usePendingDifficultyRangeState = () => useAtomValue(pendingDifficultyRangeAtom, { store });
export const useSetPendingDifficultyRange = () => useSetAtom(pendingDifficultyRangeAtom, { store });
export const readPendingDifficultyRange = () => store.get(pendingDifficultyRangeAtom);

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const setIsSearching = (value: boolean) => store.set(isSearchingAtom, value);
