import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import { resultListSearchParams } from "@/utils/queries/schema/result-list";

const store = createStore();
export const getTimelineAtomStore = () => store;

const searchAtom = atomWithReset({
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

export const useReadSearchRange = () => {
  return useAtomCallback(
    useCallback((get) => get(searchAtom), []),
    { store },
  );
};

export const searchResultKpmAtom = focusAtom(searchAtom, (optic) => optic.prop("kpm"));
export const useSearchResultKpmState = () => useAtomValue(searchResultKpmAtom, { store });
export const useSetSearchResultKpm = () => useSetAtom(searchResultKpmAtom, { store });

export const searchResultClearRateAtom = focusAtom(searchAtom, (optic) => optic.prop("clearRate"));
export const useSearchResultClearRateState = () => useAtomValue(searchResultClearRateAtom, { store });
export const useSetSearchResultClearRate = () => useSetAtom(searchResultClearRateAtom, { store });

export const searchResultSpeedRangeAtom = focusAtom(searchAtom, (optic) => optic.prop("playSpeed"));
export const useSearchResultSpeedState = () => useAtomValue(searchResultSpeedRangeAtom, { store });
export const useSetSearchResultSpeed = () => useSetAtom(searchResultSpeedRangeAtom, { store });

export const searchResultModeAtom = focusAtom(searchAtom, (optic) => optic.prop("mode"));
export const useSearchResultModeState = () => useAtomValue(searchResultModeAtom, { store });
export const useSetSearchResultMode = () => useSetAtom(searchResultModeAtom, { store });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const useSetIsSearching = () => useSetAtom(isSearchingAtom, { store });
