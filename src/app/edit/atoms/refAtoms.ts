import { atom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

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
