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

export const resetSubstatusState = () => {
  store.set(substatusAtom, RESET);
  resetSubStatusCache();
};

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

const prevSubStatus = {
  elapsedSecTime: -1,
  lineRemainTime: -1,
  lineKpm: -1,
  combo: -1,
};

store.sub(substatusAtom, () => {
  const current = store.get(substatusAtom);

  requestDebouncedAnimationFrame("substatus-update", () => {
    if (prevSubStatus.elapsedSecTime !== current.elapsedSecTime) {
      const element = store.get(elapsedSecTimeElementAtom);
      if (element) {
        element.textContent = String(formatTime(current.elapsedSecTime));
      }
      prevSubStatus.elapsedSecTime = current.elapsedSecTime;
    }

    if (prevSubStatus.lineRemainTime !== current.lineRemainTime) {
      const element = store.get(lineRemainTimeElementAtom);
      if (element) {
        element.textContent = current.lineRemainTime.toFixed(1);
      }
      prevSubStatus.lineRemainTime = current.lineRemainTime;
    }

    if (prevSubStatus.lineKpm !== current.lineKpm) {
      const element = store.get(lineKpmElementAtom);
      if (element) {
        element.textContent = current.lineKpm.toFixed(0);
      }
      prevSubStatus.lineKpm = current.lineKpm;
    }

    if (prevSubStatus.combo !== current.combo) {
      const element = store.get(comboElementAtom);
      if (element) {
        element.textContent = String(current.combo);
      }
      prevSubStatus.combo = current.combo;
    }
  });
});

export const resetSubStatusCache = () => {
  prevSubStatus.elapsedSecTime = -1;
  prevSubStatus.lineRemainTime = -1;
  prevSubStatus.lineKpm = -1;
  prevSubStatus.combo = -1;
};
