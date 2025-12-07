import { atom, type ExtractAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import { focusAtom } from "jotai-optics";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import { formatTime } from "@/utils/format-time";
import type { Updater } from "@/utils/types";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const substatusAtom = atomWithReset({
  elapsedSecTime: 0,
  lineRemainTime: 0,
  lineKpm: 0,
  combo: 0,
});

const focusSubStatusAtoms = {
  elapsedSecTime: focusAtom(substatusAtom, (optic) => optic.prop("elapsedSecTime")),
  lineRemainTime: focusAtom(substatusAtom, (optic) => optic.prop("lineRemainTime")),
  lineKpm: focusAtom(substatusAtom, (optic) => optic.prop("lineKpm")),
  combo: focusAtom(substatusAtom, (optic) => optic.prop("combo")),
};

export const resetSubstatusState = () => store.set(substatusAtom, RESET);

export const setLineRemainTime = (value: ExtractAtomValue<typeof focusSubStatusAtoms.lineRemainTime>) =>
  store.set(focusSubStatusAtoms.lineRemainTime, value);

export const setLineKpm = (value: ExtractAtomValue<typeof focusSubStatusAtoms.lineKpm>) =>
  store.set(focusSubStatusAtoms.lineKpm, value);
export const readLineKpm = () => store.get(focusSubStatusAtoms.lineKpm);

export const setCombo = (update: Updater<ExtractAtomValue<typeof focusSubStatusAtoms.combo>>) =>
  store.set(focusSubStatusAtoms.combo, update);
export const readCombo = () => store.get(focusSubStatusAtoms.combo);

export const setElapsedSecTime = (value: ExtractAtomValue<typeof focusSubStatusAtoms.elapsedSecTime>) =>
  store.set(focusSubStatusAtoms.elapsedSecTime, value);
export const readElapsedSecTime = () => store.get(focusSubStatusAtoms.elapsedSecTime);

const elapsedSecTimeElementAtom = atom<HTMLSpanElement | null>(null);
const lineRemainTimeElementAtom = atom<HTMLSpanElement | null>(null);
const lineKpmElementAtom = atom<HTMLSpanElement | null>(null);
const comboElementAtom = atom<HTMLSpanElement | null>(null);

export const setElapsedSecTimeElement = (element: HTMLSpanElement | null) =>
  store.set(elapsedSecTimeElementAtom, element);
export const setLineRemainTimeElement = (element: HTMLSpanElement | null) =>
  store.set(lineRemainTimeElementAtom, element);
export const setLineKpmElement = (element: HTMLSpanElement | null) => store.set(lineKpmElementAtom, element);
export const setComboElement = (element: HTMLSpanElement | null) => store.set(comboElementAtom, element);

store.sub(focusSubStatusAtoms.elapsedSecTime, () => {
  const element = store.get(elapsedSecTimeElementAtom);
  if (element) {
    requestDebouncedAnimationFrame("elapsedSecTime", () => {
      element.textContent = String(formatTime(store.get(focusSubStatusAtoms.elapsedSecTime)));
    });
  }
});

store.sub(focusSubStatusAtoms.lineRemainTime, () => {
  const element = store.get(lineRemainTimeElementAtom);
  if (element) {
    requestDebouncedAnimationFrame("lineRemainTime", () => {
      element.textContent = store.get(focusSubStatusAtoms.lineRemainTime).toFixed(1);
    });
  }
});

store.sub(focusSubStatusAtoms.lineKpm, () => {
  const element = store.get(lineKpmElementAtom);
  if (element) {
    requestDebouncedAnimationFrame("lineKpm", () => {
      element.textContent = store.get(focusSubStatusAtoms.lineKpm).toFixed(0);
    });
  }
});

store.sub(focusSubStatusAtoms.combo, () => {
  const element = store.get(comboElementAtom);
  if (element) {
    requestDebouncedAnimationFrame("combo", () => {
      element.textContent = String(store.get(focusSubStatusAtoms.combo));
    });
  }
});
