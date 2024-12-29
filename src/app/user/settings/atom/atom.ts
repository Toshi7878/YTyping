import { atom, createStore, useAtomValue, useSetAtom } from "jotai";

const userSettingsAtomStore = createStore();
export const getUserSettingsAtomStore = () => userSettingsAtomStore;

export const newNameAtom = atom<string>("");
export const useNewNameAtom = () => {
  return useAtomValue(newNameAtom, { store: userSettingsAtomStore });
};

export const useSetNewNameAtom = () => {
  return useSetAtom(newNameAtom, { store: userSettingsAtomStore });
};
