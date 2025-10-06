import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { mapListSearchParams } from "@/utils/queries/search-params/map-list";

const store = createStore();
export const getHomeAtomStore = () => store;

export const difficultyRangeAtom = atomWithReset({
  minRate: mapListSearchParams.minRate.defaultValue,
  maxRate: mapListSearchParams.maxRate.defaultValue,
});
export const useReadDifficultyRange = () => () => store.get(difficultyRangeAtom);
export const useDifficultyRangeState = () => useAtomValue(difficultyRangeAtom, { store });
export const useSetDifficultyRange = () => useSetAtom(difficultyRangeAtom, { store });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const useSetIsSearching = () => useSetAtom(isSearchingAtom, { store });
