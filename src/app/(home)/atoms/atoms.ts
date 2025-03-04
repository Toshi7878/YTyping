import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { DIFFICULTY_RANGE } from "../ts/const/consts";

const homeAtomStore = createStore();
export const getHomeAtomStore = () => homeAtomStore;

export const searchMapKeyWordsAtom = atom<string>("");

export const useSearchMapKeyWordsAtom = () => {
  return useAtomValue(searchMapKeyWordsAtom, { store: homeAtomStore });
};

export const useSetSearchMapKeyWordsAtom = () => {
  return useSetAtom(searchMapKeyWordsAtom, { store: homeAtomStore });
};

export const difficultyRangeAtom = atom<{ min: number; max: number }>(DIFFICULTY_RANGE);

export const useDifficultyRangeAtom = () => {
  return useAtomValue(difficultyRangeAtom, { store: homeAtomStore });
};

export const useSetDifficultyRangeAtom = () => {
  return useSetAtom(difficultyRangeAtom, { store: homeAtomStore });
};

const isSearchingAtom = atom(false);

export const useIsSearchingAtom = () => {
  return useAtomValue(isSearchingAtom, { store: homeAtomStore });
};

export const useSetIsSearchingAtom = () => {
  return useSetAtom(isSearchingAtom, { store: homeAtomStore });
};
