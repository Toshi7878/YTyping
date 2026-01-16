import { atom, createStore, useAtomValue } from "jotai";
import type { MAP_LIST_LAYOUT_TYPES } from "@/server/drizzle/schema";

const store = createStore();
export const getHomeAtomStore = () => store;

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom, { store });
export const setIsSearching = (value: boolean) => store.set(isSearchingAtom, value);

export const listLayoutTypeAtom = atom<(typeof MAP_LIST_LAYOUT_TYPES)[number]>("TWO_COLUMNS");

export const useListLayoutTypeState = () => useAtomValue(listLayoutTypeAtom, { store });
export const setListLayoutType = (value: (typeof MAP_LIST_LAYOUT_TYPES)[number]) =>
  store.set(listLayoutTypeAtom, value);
