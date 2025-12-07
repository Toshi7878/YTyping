import { atom, type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import { focusAtom } from "jotai-optics";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
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

const focusAtoms = {
  score: focusAtom(typingStatusAtom, (optic) => optic.prop("score")),
  type: focusAtom(typingStatusAtom, (optic) => optic.prop("type")),
  kpm: focusAtom(typingStatusAtom, (optic) => optic.prop("kpm")),
  rank: focusAtom(typingStatusAtom, (optic) => optic.prop("rank")),
  point: focusAtom(typingStatusAtom, (optic) => optic.prop("point")),
  miss: focusAtom(typingStatusAtom, (optic) => optic.prop("miss")),
  lost: focusAtom(typingStatusAtom, (optic) => optic.prop("lost")),
  line: focusAtom(typingStatusAtom, (optic) => optic.prop("line")),
  timeBonus: focusAtom(typingStatusAtom, (optic) => optic.prop("timeBonus")),
};
export const useTypingStatusState = () => useAtomValue(typingStatusAtom, { store });
export const setLineStatus = (value: ExtractAtomValue<typeof focusAtoms.line>) => store.set(focusAtoms.line, value);
export const setRankStatus = (value: ExtractAtomValue<typeof focusAtoms.rank>) => store.set(focusAtoms.rank, value);
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

const statusValueElementsAtom = atom<{
  score: HTMLSpanElement;
  type: HTMLSpanElement;
  kpm: HTMLSpanElement;
  rank: HTMLSpanElement;
  point: HTMLSpanElement;
  miss: HTMLSpanElement;
  lost: HTMLSpanElement;
  line: HTMLSpanElement;
  timeBonus: HTMLSpanElement;
} | null>(null);

export const setStatusElements = (elements: ExtractAtomValue<typeof statusValueElementsAtom>) => {
  store.set(statusValueElementsAtom, elements);
};

(Object.keys(focusAtoms) as (keyof typeof focusAtoms)[]).forEach((key) => {
  store.sub(focusAtoms[key], () => {
    const statusValueElements = store.get(statusValueElementsAtom);
    const element = statusValueElements?.[key];
    if (element) {
      const newValue = store.get(focusAtoms[key]);

      requestDebouncedAnimationFrame(key, () => {
        if (key === "timeBonus") {
          if (newValue === 0) {
            element.textContent = "";
            return;
          }
          element.textContent = `+${String(newValue)}`;
        } else {
          element.textContent = String(newValue);
        }
      });
    }
  });
});
