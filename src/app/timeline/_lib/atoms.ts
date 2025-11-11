import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import { CLEAR_RATE_LIMIT, KPM_LIMIT, PLAY_SPEED_LIMIT, type RESULT_INPUT_METHOD_TYPES } from "@/validator/result";

const store = createStore();
export const getTimelineAtomStore = () => store;

const searchPendingAtom = atomWithReset({
  kpm: {
    min: KPM_LIMIT.min,
    max: KPM_LIMIT.max,
  },
  clearRate: {
    min: CLEAR_RATE_LIMIT.min,
    max: CLEAR_RATE_LIMIT.max,
  },
  playSpeed: {
    min: PLAY_SPEED_LIMIT.min,
    max: PLAY_SPEED_LIMIT.max,
  },
  mode: null as (typeof RESULT_INPUT_METHOD_TYPES)[number] | null,
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
