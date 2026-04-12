import { atom, type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import { focusAtom } from "jotai-optics";
import type { Updater } from "@/utils/types";
import { readUtilityRefParams } from "./ref";
import { readBuiltMap } from "./state";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const typingStatusAtom = atomWithReset({
  score: 0,
  type: 0,
  kpm: 0,
  rank: 0,
  point: 0,
  miss: 0,
  lost: 0,
  line: 0,
  timeBonus: 0,
});
export type TypingStatus = ExtractAtomValue<typeof typingStatusAtom>;

const timeBonusAtom = focusAtom(typingStatusAtom, (optic) => optic.prop("timeBonus"));

export const typingStatusDisplayAtoms = {
  score: focusAtom(typingStatusAtom, (optic) => optic.prop("score")),
  point: focusAtom(typingStatusAtom, (optic) => optic.prop("point")),
  timeBonus: atom((get) => {
    const timeBonus = get(timeBonusAtom);
    return timeBonus === 0 ? "" : `+${String(timeBonus)}`;
  }),
  type: focusAtom(typingStatusAtom, (optic) => optic.prop("type")),
  kpm: focusAtom(typingStatusAtom, (optic) => optic.prop("kpm")),
  miss: focusAtom(typingStatusAtom, (optic) => optic.prop("miss")),
  lost: focusAtom(typingStatusAtom, (optic) => optic.prop("lost")),
  rank: focusAtom(typingStatusAtom, (optic) => optic.prop("rank")),
  line: focusAtom(typingStatusAtom, (optic) => optic.prop("line")),
};
export const useTypingStatusState = () => useAtomValue(typingStatusAtom, { store });
export const setLineStatus = (value: ExtractAtomValue<typeof typingStatusDisplayAtoms.line>) =>
  store.set(typingStatusDisplayAtoms.line, value);
export const setRankStatus = (value: ExtractAtomValue<typeof typingStatusDisplayAtoms.rank>) =>
  store.set(typingStatusDisplayAtoms.rank, value);
export const setAllTypingStatus = (update: Updater<ExtractAtomValue<typeof typingStatusAtom>>) =>
  store.set(typingStatusAtom, update);
export const resetAllTypingStatus = () => {
  store.set(typingStatusAtom, RESET);
  const map = readBuiltMap();
  setLineStatus(map?.typingLineIndexes.length || 0);
  const { rankingScores } = readUtilityRefParams();
  setRankStatus(rankingScores.length + 1);
};
export const readTypingStatus = () => store.get(typingStatusAtom);
