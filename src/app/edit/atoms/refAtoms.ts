import { YTPlayer } from "@/types/global-types";
import { atom, ExtractAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { mapReducerAtom } from "./mapReducerAtom";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const editUtilsRefAtom = atomWithReset({
  preventAutoTabToggle: false,
  tableScrollIndex: null as number | null,
});
const tableScrollIndexAtom = focusAtom(editUtilsRefAtom, (optic) => optic.prop("tableScrollIndex"));

store.sub(tableScrollIndexAtom, () => {
  const map = store.get(mapReducerAtom);
  const tbody = store.get(tbodyRefAtom);
  const scrollIndex = store.get(tableScrollIndexAtom);

  if (map.length > 0 && tbody) {
    for (let i = map.length - 1; i >= 0; i--) {
      if (i == scrollIndex) {
        const targetRow = tbody.children[i];

        if (targetRow && targetRow instanceof HTMLElement) {
          const parentElement = targetRow.parentElement!.parentElement!.parentElement;
          if (parentElement && targetRow instanceof HTMLElement) {
            parentElement.scrollTo({
              top: targetRow.offsetTop - parentElement.offsetTop - targetRow.offsetHeight,
              behavior: "smooth",
            });
          }
        }

        break;
      }
    }
  }
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

export const timeInputRef = atom<HTMLInputElement | null>(null);

export const useTimeInput = () => {
  const readTime = useAtomCallback(
    useCallback((get) => {
      const input = get(timeInputRef) as HTMLInputElement;
      return input.value;
    }, []),
    { store }
  );
  const setTime = useAtomCallback(
    useCallback((get, set, newValue: number | string | null) => {
      const timeInput = get(timeInputRef) as HTMLInputElement;

      timeInput.value = newValue === null ? "" : String(newValue);
    }, []),
    { store }
  );

  const writeTimeInput = useAtomCallback(
    useCallback((get, set, timeInput: HTMLInputElement) => {
      set(timeInputRef, timeInput);
    }, []),
    { store }
  );

  return { readTime, setTime, writeTimeInput };
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
export const timeRangeRef = atom<HTMLInputElement | null>(null);

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
