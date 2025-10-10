import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import { resultListSearchParams } from "@/lib/queries/schema/result-list";

const store = createStore();
export const getTimelineAtomStore = () => store;

const searchPendingAtom = atomWithReset({
  kpm: {
    min: resultListSearchParams.minKpm.defaultValue,
    max: resultListSearchParams.maxKpm.defaultValue,
  },
  clearRate: {
    min: resultListSearchParams.minClearRate.defaultValue,
    max: resultListSearchParams.maxClearRate.defaultValue,
  },
  playSpeed: {
    min: resultListSearchParams.minPlaySpeed.defaultValue,
    max: resultListSearchParams.maxPlaySpeed.defaultValue,
  },
  mode: resultListSearchParams.mode.defaultValue,
});

export const useReadSearchPendingParams = () => {
  return useAtomCallback(
    useCallback((get) => get(searchPendingAtom), []),
    { store },
  );
};

export const searchResultKpmAtom = focusAtom(searchPendingAtom, (optic) => optic.prop("kpm"));
export const useSearchResultKpmState = () => useAtomValue(searchResultKpmAtom, { store });
export const useSetSearchResultKpm = () => useSetAtom(searchResultKpmAtom, { store });

export const searchResultClearRateAtom = focusAtom(searchPendingAtom, (optic) => optic.prop("clearRate"));
export const useSearchResultClearRateState = () => useAtomValue(searchResultClearRateAtom, { store });
export const useSetSearchResultClearRate = () => useSetAtom(searchResultClearRateAtom, { store });

export const searchResultSpeedRangeAtom = focusAtom(searchPendingAtom, (optic) => optic.prop("playSpeed"));
export const useSearchResultSpeedState = () => useAtomValue(searchResultSpeedRangeAtom, { store });
export const useSetSearchResultSpeed = () => useSetAtom(searchResultSpeedRangeAtom, { store });

export const searchResultModeAtom = focusAtom(searchPendingAtom, (optic) => optic.prop("mode"));
export const useSearchResultModeState = () => useAtomValue(searchResultModeAtom, { store });
export const useSetSearchResultMode = () => useSetAtom(searchResultModeAtom, { store });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const useSetIsSearching = () => useSetAtom(isSearchingAtom, { store });
