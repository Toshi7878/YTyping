import { YTPlayer } from "@/types/global-types";
import { atom, ExtractAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { mapReducerAtom } from "./mapReducerAtom";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const editUtilsParamsAtom = atomWithReset({
  preventAutoTabToggle: false,
  tableScrollIndex: null as number | null,
});
const tableScrollIndexAtom = focusAtom(editUtilsParamsAtom, (optic) => optic.prop("tableScrollIndex"));

store.sub(tableScrollIndexAtom, () => {
  const map = store.get(mapReducerAtom);
  const tbody = store.get(tbodyAtom);
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

export const useEditUtilsParams = () => {
  const readEditUtils = useAtomCallback(
    useCallback((get) => get(editUtilsParamsAtom), []),
    { store },
  );

  const writeEditUtils = useAtomCallback(
    useCallback((get, set, newGameState: Partial<ExtractAtomValue<typeof editUtilsParamsAtom>>) => {
      set(editUtilsParamsAtom, (prev) => {
        return { ...prev, ...newGameState };
      });
    }, []),
  );

  return { readEditUtils, writeEditUtils };
};

export const timeInputAtom = atom<HTMLInputElement | null>(null);

export const useTimeInput = () => {
  const readTime = useAtomCallback(
    useCallback((get) => {
      const input = get(timeInputAtom) as HTMLInputElement;
      return input.value;
    }, []),
    { store },
  );
  const setTime = useAtomCallback(
    useCallback((get, set, newValue: number | string | null) => {
      const timeInput = get(timeInputAtom) as HTMLInputElement;

      timeInput.value = newValue === null ? "" : String(newValue);
    }, []),
    { store },
  );

  const writeTimeInput = useAtomCallback(
    useCallback((get, set, timeInput: HTMLInputElement) => {
      set(timeInputAtom, timeInput);
    }, []),
    { store },
  );

  return { readTime, setTime, writeTimeInput };
};

const tbodyAtom = atom<HTMLElement | null>(null);

export const useTbody = () => {
  const readTbody = useAtomCallback(
    useCallback((get) => get(tbodyAtom) as HTMLElement, []),
    { store },
  );

  const writeTbody = useAtomCallback(
    useCallback((get, set, tbody: HTMLElement) => {
      set(tbodyAtom, tbody);
    }, []),
    { store },
  );

  return { readTbody, writeTbody };
};

export const playerAtom = atom<YTPlayer | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerAtom) as YTPlayer, []),
    { store },
  );

  const writePlayer = useAtomCallback(
    useCallback((get, set, player: YTPlayer) => {
      set(playerAtom, player);
    }, []),
    { store },
  );

  return { readPlayer, writePlayer };
};
const timeRangeAtom = atom<HTMLInputElement | null>(null);

export const useTimeRange = () => {
  const readTimeRange = useAtomCallback(
    useCallback((get) => get(timeRangeAtom) as HTMLInputElement, []),
    { store },
  );

  const writeTimeRange = useAtomCallback(
    useCallback((get, set, timeRange: HTMLInputElement) => {
      set(timeRangeAtom, timeRange);
    }, []),
    { store },
  );

  return { readTimeRange, writeTimeRange };
};
