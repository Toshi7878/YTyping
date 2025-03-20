import { YTPlayer } from "@/types/global-types";
import { atom, ExtractAtomValue } from "jotai";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const editUtilsRefAtom = atomWithReset({
  preventAutoTabToggle: false,
});

export const useEditUtilsRef = () => {
  const readEditUtils = useAtomCallback(
    useCallback((get) => get(editUtilsRefAtom), []),
    { store }
  );

  const writeEditUtils = useAtomCallback(
    useCallback((get, set, newGameState: Partial<ExtractAtomValue<typeof editUtilsRefAtom>>) => {
      set(editUtilsRefAtom, (prev) => {
        return { ...prev, ...newGameState };
      });
    }, [])
  );

  return { readEditUtils, writeEditUtils };
};

const timeInputRef = atom<HTMLInputElement | null>(null);

export const useTimeInput = () => {
  const readTimeInput = useAtomCallback(
    useCallback((get) => get(timeInputRef) as HTMLInputElement, []),
    { store }
  );

  const writeTimeInput = useAtomCallback(
    useCallback((get, set, timeInput: HTMLInputElement) => {
      set(timeInputRef, timeInput);
    }, []),
    { store }
  );

  return { readTimeInput, writeTimeInput };
};

const tbodyRefAtom = atom<HTMLElement | null>(null);

export const useTbodyRef = () => {
  const readTbody = useAtomCallback(
    useCallback((get) => get(tbodyRefAtom) as HTMLElement, []),
    { store }
  );

  const writeTbody = useAtomCallback(
    useCallback((get, set, tbody: HTMLElement) => {
      set(tbodyRefAtom, tbody);
    }, []),
    { store }
  );

  return { readTbody, writeTbody };
};

const playerRef = atom<YTPlayer | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerRef) as YTPlayer, []),
    { store }
  );

  const writePlayer = useAtomCallback(
    useCallback((get, set, player: YTPlayer) => {
      set(playerRef, player);
    }, []),
    { store }
  );

  return { readPlayer, writePlayer };
};
const timeRangeRef = atom<HTMLInputElement | null>(null);

export const useTimeRange = () => {
  const readTimeRange = useAtomCallback(
    useCallback((get) => get(timeRangeRef) as HTMLInputElement, []),
    { store }
  );

  const writeTimeRange = useAtomCallback(
    useCallback((get, set, timeRange: HTMLInputElement) => {
      set(timeRangeRef, timeRange);
    }, []),
    { store }
  );

  return { readTimeRange, writeTimeRange };
};
