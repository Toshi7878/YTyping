import type { ExtractAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { getTypingGameAtomStore } from "./store";

const store = getTypingGameAtomStore();

const typingStatsAtom = atomWithReset({
  romaType: 0,
  kanaType: 0,
  flickType: 0,
  englishType: 0,
  spaceType: 0,
  symbolType: 0,
  numType: 0,
  typingTime: 0,
  maxCombo: 0,
});
export type TypingStats = ExtractAtomValue<typeof typingStatsAtom>;

export const getTypingStats = () => store.get(typingStatsAtom);
export const setTypingStats = (newUserStats: Partial<TypingStats>) =>
  store.set(typingStatsAtom, (prev) => ({ ...prev, ...newUserStats }));
export const resetTypingStats = () => store.set(typingStatsAtom, RESET);
