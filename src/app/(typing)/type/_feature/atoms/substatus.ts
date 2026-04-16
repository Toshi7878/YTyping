import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { store } from "./store";

const typingSubstatusAtom = atomWithReset({
  romaType: 0,
  kanaType: 0,
  flickType: 0,
  englishType: 0,
  spaceType: 0,
  symbolType: 0,
  numType: 0,
  clearRate: 100,
  kanaToRomaConvertCount: 0,
  maxCombo: 0,
  missCombo: 0,
  totalTypeTime: 0,
  completeCount: 0,
  failureCount: 0,
});

export type TypingSubstatus = ExtractAtomValue<typeof typingSubstatusAtom>;
export const getTypingSubstatus = () => store.get(typingSubstatusAtom);
export const setTypingSubstatus = (newSubstatus: Partial<TypingSubstatus>) =>
  store.set(typingSubstatusAtom, (prev) => ({ ...prev, ...newSubstatus }));
export const resetTypingSubstatus = () => store.set(typingSubstatusAtom, RESET);

const lineCompleteCountAtom = focusAtom(typingSubstatusAtom, (optic) => optic.prop("completeCount"));
const lineFailureCountAtom = focusAtom(typingSubstatusAtom, (optic) => optic.prop("failureCount"));

export const useLineCompleteCountState = () => useAtomValue(lineCompleteCountAtom);
export const useLineFailureCountState = () => useAtomValue(lineFailureCountAtom);
