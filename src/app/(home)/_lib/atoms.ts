import { atom, createStore, useAtomValue } from "jotai";

const store = createStore();
export const getHomeAtomStore = () => store;

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const setIsSearching = (value: boolean) => store.set(isSearchingAtom, value);
