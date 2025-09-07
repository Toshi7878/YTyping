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
  const scrollIndex = store.get(tableScrollIndexAtom);
  const tbody = document.getElementById("map-table-tbody");

  if (map.length > 0 && tbody) {
    for (let i = map.length - 1; i >= 0; i--) {
      if (i == scrollIndex) {
        const targetRow = tbody.children[i];

        if (targetRow && targetRow instanceof HTMLElement) {
          const tableCard = targetRow.closest<HTMLDivElement>("#map-table-card");
          if (tableCard) {
            tableCard.scrollTo({
              top: targetRow.offsetTop - tableCard.offsetTop - targetRow.offsetHeight,
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
