import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE } from "./consts";
import type { FilterMode } from "./type";
const store = createStore();
export const getTimelineAtomStore = () => store;

const searchAtom = atomWithReset({
  kpm: {
    minValue: DEFAULT_KPM_SEARCH_RANGE.min,
    maxValue: DEFAULT_KPM_SEARCH_RANGE.max,
  },
  clearRate: {
    minValue: DEFAULT_CLEAR_RATE_SEARCH_RANGE.min,
    maxValue: DEFAULT_CLEAR_RATE_SEARCH_RANGE.max,
  },
  playSpeed: {
    minValue: 1,
    maxValue: 2,
  },
  mode: "all" as FilterMode,
});

export const useReadSearchRange = () => {
  return useAtomCallback(
    useCallback((get) => get(searchAtom), []),
    { store },
  );
};

export const searchResultKpmAtom = focusAtom(searchAtom, (optic) => optic.prop("kpm"));
export const useSearchResultKpmState = () => useAtomValue(searchResultKpmAtom, { store });
export const useSetSearchResultKpm = () => useSetAtom(searchResultKpmAtom, { store });

const searchResultClearRateAtom = focusAtom(searchAtom, (optic) => optic.prop("clearRate"));
export const useSearchResultClearRateState = () => useAtomValue(searchResultClearRateAtom, { store });
export const useSetSearchResultClearRate = () => useSetAtom(searchResultClearRateAtom, { store });

const searchResultSpeedRangeAtom = focusAtom(searchAtom, (optic) => optic.prop("playSpeed"));
export const useSearchResultSpeedState = () => useAtomValue(searchResultSpeedRangeAtom, { store });
export const useSetSearchResultSpeed = () => useSetAtom(searchResultSpeedRangeAtom, { store });

export const searchResultModeAtom = focusAtom(searchAtom, (optic) => optic.prop("mode"));
export const useSearchResultModeState = () => useAtomValue(searchResultModeAtom, { store });
export const useSetSearchResultMode = () => useSetAtom(searchResultModeAtom, { store });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const useSetIsSearching = () => useSetAtom(isSearchingAtom, { store });
