import { YTPlayer } from "@/types/global-types";
import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
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
  ime_type: 0,
  total_type_time: 0,
});

const totalTypingTimeAtom = focusAtom(userStatsAtom, (optic) => optic.prop("total_type_time"));
const totalImeTypeAtom = focusAtom(userStatsAtom, (optic) => optic.prop("ime_type"));

export const useUserStats = () => {
  const readUserStats = useAtomCallback(
    useCallback((get) => get(userStatsAtom), []),
    { store }
  );

  const incrementTypingTime = useAtomCallback(
    useCallback((get, set, time: number) => {
      set(totalTypingTimeAtom, (prev) => prev + time);
    }, []),
    { store }
  );

  const incrementImeType = useAtomCallback(
    useCallback((get, set, imeTypeCount: number) => {
      set(totalImeTypeAtom, (prev) => prev + imeTypeCount);
    }, [])
  );

  const resetUserStats = useAtomCallback(
    useCallback((get, set) => {
      set(userStatsAtom, RESET);
    }, []),
    { store }
  );

  return { readUserStats, resetUserStats, incrementImeType, incrementTypingTime };
};
