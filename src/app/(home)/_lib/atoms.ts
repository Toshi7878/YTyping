import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { mapListSearchParams } from "@/utils/queries/search-params/map-list";

const store = createStore();
export const getHomeAtomStore = () => store;

export const difficultyRateRangeAtom = atomWithReset({
  minRate: mapListSearchParams.minRate.defaultValue,
  maxRate: mapListSearchParams.maxRate.defaultValue,
});
export const useReadDifficultyRange = () => () => store.get(difficultyRateRangeAtom);
export const useDifficultyRangeState = () => useAtomValue(difficultyRateRangeAtom, { store });
export const useSetDifficultyRange = () => useSetAtom(difficultyRateRangeAtom, { store });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const useSetIsSearching = () => useSetAtom(isSearchingAtom, { store });
