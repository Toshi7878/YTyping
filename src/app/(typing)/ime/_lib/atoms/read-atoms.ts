import { atom } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import type {} from "@/types/types";
import { getImeTypeAtomStore } from "./store";

const store = getImeTypeAtomStore();

export const playerAtom = atom<YT.Player | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerAtom) as YT.Player, []),
    { store },
  );

  const writePlayer = useAtomCallback(
    useCallback((_get, set, newPlayer: YT.Player | null) => {
      set(playerAtom, newPlayer);
    }, []),
    { store },
  );

  return { readPlayer, writePlayer };
};

const lyricsContainerAtom = atom<HTMLDivElement | null>(null);

export const useLyricsContainer = () => {
  const readLyricsContainer = useAtomCallback(
    useCallback((get) => get(lyricsContainerAtom) as HTMLDivElement, []),
    { store },
  );

  const writeLyricsContainer = useAtomCallback(
    useCallback((_get, set, newLyricsContainer: HTMLDivElement) => {
      set(lyricsContainerAtom, newLyricsContainer);
    }, []),
    { store },
  );

  return { readLyricsContainer, writeLyricsContainer };
};

const inputTextareaAtom = atom<HTMLTextAreaElement | null>(null);

export const useInputTextarea = () => {
  const readInputTextarea = useAtomCallback(
    useCallback((get) => get(inputTextareaAtom) as HTMLTextAreaElement, []),
    { store },
  );

  const writeInputTextarea = useAtomCallback(
    useCallback((_get, set, newLyricsTextarea: HTMLTextAreaElement) => {
      set(inputTextareaAtom, newLyricsTextarea);
    }, []),
    { store },
  );

  return { readInputTextarea, writeInputTextarea };
};

const userStatsAtom = atomWithReset({ imeTypeCount: 0, typingTime: 0 });

const typingTimeAtom = focusAtom(userStatsAtom, (optic) => optic.prop("typingTime"));
const imeTypeCountAtom = focusAtom(userStatsAtom, (optic) => optic.prop("imeTypeCount"));

export const useUserStats = () => {
  const readUserStats = useAtomCallback(
    useCallback((get) => get(userStatsAtom), []),
    { store },
  );

  const incrementTypingTime = useAtomCallback(
    useCallback((_get, set, time: number) => {
      set(typingTimeAtom, (prev) => prev + time);
    }, []),
    { store },
  );

  const incrementImeType = useAtomCallback(
    useCallback((_get, set, imeTypeCount: number) => {
      set(imeTypeCountAtom, (prev) => prev + imeTypeCount);
    }, []),
  );

  const resetUserStats = useAtomCallback(
    useCallback((_get, set) => {
      set(userStatsAtom, RESET);
    }, []),
    { store },
  );

  return { readUserStats, resetUserStats, incrementImeType, incrementTypingTime };
};
