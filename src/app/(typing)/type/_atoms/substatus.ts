import { atom, type ExtractAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import { focusAtom } from "jotai-optics";
import { formatTime } from "@/utils/format-time";
import type { Updater } from "@/utils/types";
import { getTypingGameAtomStore } from "./store";

const store = getTypingGameAtomStore();

const substatusAtom = atomWithReset({
  elapsedSecTime: 0,
  lineRemainTime: 0,
  lineKpm: 0,
  combo: 0,
});

const elapsedSecTimeAtom = focusAtom(substatusAtom, (optic) => optic.prop("elapsedSecTime"));
export const elapsedSecFormatTimeAtom = atom((get) => {
  const elapsedSecTime = get(elapsedSecTimeAtom);
  return formatTime(elapsedSecTime);
});

const lineRemainTimeAtom = focusAtom(substatusAtom, (optic) => optic.prop("lineRemainTime"));
export const lineRemainFormatTimeAtom = atom((get) => {
  const lineRemainTime = get(lineRemainTimeAtom);
  return lineRemainTime.toFixed(1);
});

const lineKpmAtom = focusAtom(substatusAtom, (optic) => optic.prop("lineKpm"));
export const lineKpmFormatAtom = atom((get) => {
  const lineKpm = get(lineKpmAtom);
  return lineKpm.toFixed(0);
});

export const comboAtom = focusAtom(substatusAtom, (optic) => optic.prop("combo"));

export const resetSubstatusState = () => store.set(substatusAtom, RESET);

export const setLineRemainTime = (value: ExtractAtomValue<typeof lineRemainTimeAtom>) =>
  store.set(lineRemainTimeAtom, value);

export const setLineKpm = (value: ExtractAtomValue<typeof lineKpmAtom>) => store.set(lineKpmAtom, value);
export const readLineKpm = () => store.get(lineKpmAtom);
export const setCombo = (update: Updater<ExtractAtomValue<typeof comboAtom>>) => store.set(comboAtom, update);
export const readCombo = () => store.get(comboAtom);

export const setElapsedSecTime = (value: ExtractAtomValue<typeof elapsedSecTimeAtom>) =>
  store.set(elapsedSecTimeAtom, value);
export const readElapsedSecTime = () => store.get(elapsedSecTimeAtom);
