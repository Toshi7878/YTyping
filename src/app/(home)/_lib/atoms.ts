import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { mapListSearchParams } from "@/utils/queries/schema/map-list";

const store = createStore();
export const getHomeAtomStore = () => store;

export const pendingDifficultyRangeAtom = atomWithReset({
  minRate: mapListSearchParams.minRate.defaultValue,
  maxRate: mapListSearchParams.maxRate.defaultValue,
});
export const useReadPendingDifficultyRange = () => () => store.get(pendingDifficultyRangeAtom);
export const usePendingDifficultyRangeState = () => useAtomValue(pendingDifficultyRangeAtom, { store });
export const useSetPendingDifficultyRange = () => useSetAtom(pendingDifficultyRangeAtom, { store });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const useSetIsSearching = () => useSetAtom(isSearchingAtom, { store });
