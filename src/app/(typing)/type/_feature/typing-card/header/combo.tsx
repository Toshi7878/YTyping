import { atom } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import type { Updater } from "@/utils/types";
import { getTypingGameAtomStore } from "../../atoms/store";

const store = getTypingGameAtomStore();
const comboAtom = atom(0);
export const setCombo = (update: Updater<number>) => store.set(comboAtom, update);
export const getCombo = () => store.get(comboAtom);

export const Combo = () => {
  return (
    <uncontrolled.span id="combo" atomStore={store}>
      {comboAtom}
    </uncontrolled.span>
  );
};
