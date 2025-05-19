import { YTPlayer } from "@/types/global-types";
import { atom, ExtractAtomValue } from "jotai";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { getImeTypeAtomStore } from "./store";
const store = getImeTypeAtomStore();

export const playerAtom = atom<YTPlayer | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerAtom) as YTPlayer, []),
    { store }
  );

  const writePlayer = useAtomCallback(
    useCallback((get, set, newPlayer: YTPlayer | null) => {
      set(playerAtom, newPlayer);
    }, []),
    { store }
  );

  return { readPlayer, writePlayer };
};

const lyricsContainerAtom = atom<HTMLDivElement | null>(null);

export const useLyricsContainer = () => {
  const readLyricsContainer = useAtomCallback(
    useCallback((get) => get(lyricsContainerAtom) as HTMLDivElement, []),
    { store }
  );

  const writeLyricsContainer = useAtomCallback(
    useCallback((get, set, newLyricsContainer: HTMLDivElement) => {
      set(lyricsContainerAtom, newLyricsContainer);
    }, []),
    { store }
  );

  return { readLyricsContainer, writeLyricsContainer };
};

const inputTextareaAtom = atom<HTMLTextAreaElement | null>(null);

export const useInputTextarea = () => {
  const readInputTextarea = useAtomCallback(
    useCallback((get) => get(inputTextareaAtom) as HTMLTextAreaElement, []),
    { store }
  );

  const writeInputTextarea = useAtomCallback(
    useCallback((get, set, newLyricsTextarea: HTMLTextAreaElement) => {
      set(inputTextareaAtom, newLyricsTextarea);
    }, []),
    { store }
  );

  return { readInputTextarea, writeInputTextarea };
};

const userStatsAtom = atomWithReset({
  imeType: 0,
  total_typing_time: 0,
});

export const useUserStats = () => {
  const readUserStats = useAtomCallback(
    useCallback((get) => get(userStatsAtom), []),
    { store }
  );

  const writeUserStats = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof userStatsAtom>>) => {
      set(userStatsAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store }
  );

  return { readUserStats, writeUserStats };
};
