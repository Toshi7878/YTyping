import { atom, useAtomValue, useSetAtom } from "jotai";
import { getHomeAtomStore } from "../HomeProvider";

const homeAtomStore = getHomeAtomStore();

export const searchMapKeyWordsAtom = atom<string>("");

export const useSearchMapKeyWordsAtom = () => {
  return useAtomValue(searchMapKeyWordsAtom, { store: homeAtomStore });
};

export const useSetSearchMapKeyWordsAtom = () => {
  return useSetAtom(searchMapKeyWordsAtom, { store: homeAtomStore });
};
