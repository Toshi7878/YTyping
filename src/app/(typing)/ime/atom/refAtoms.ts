import { YTPlayer } from "@/types/global-types";
import { atom } from "jotai";
import { useAtomCallback } from "jotai/utils";
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

const lyricsTextareaAtom = atom<HTMLTextAreaElement | null>(null);

export const useLyricsTextarea = () => {
  const readLyricsTextarea = useAtomCallback(
    useCallback((get) => get(lyricsTextareaAtom) as HTMLTextAreaElement, []),
    { store }
  );

  const writeLyricsTextarea = useAtomCallback(
    useCallback((get, set, newLyricsTextarea: HTMLTextAreaElement) => {
      set(lyricsTextareaAtom, newLyricsTextarea);
    }, []),
    { store }
  );

  return { readLyricsTextarea, writeLyricsTextarea };
};
