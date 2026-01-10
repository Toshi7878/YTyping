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
  rank: focusAtom(typingStatusAtom, (optic) => optic.prop("rank")),
  line: focusAtom(typingStatusAtom, (optic) => optic.prop("line")),
};
export const useTypingStatusState = () => useAtomValue(typingStatusAtom, { store });
export const setLineStatus = (value: ExtractAtomValue<typeof focusAtoms.line>) => store.set(focusAtoms.line, value);
export const setRankStatus = (value: ExtractAtomValue<typeof focusAtoms.rank>) => store.set(focusAtoms.rank, value);
export const setAllTypingStatus = (update: Updater<ExtractAtomValue<typeof typingStatusAtom>>) =>
  store.set(typingStatusAtom, update);
export const resetAllTypingStatus = () => {
  store.set(typingStatusAtom, RESET);
  resetStatusCache();
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

const prevStatus = {
  score: -1,
  type: -1,
  kpm: -1,
  rank: -1,
  point: -1,
  miss: -1,
  lost: -1,
  line: -1,
  timeBonus: -1,
};

store.sub(typingStatusAtom, () => {
  const elements = store.get(statusValueElementsAtom);
  if (!elements) return;

  const current = store.get(typingStatusAtom);

  requestDebouncedAnimationFrame("status-update", () => {
    if (prevStatus.score !== current.score) {
      elements.score.textContent = String(current.score);
      prevStatus.score = current.score;
    }
    if (prevStatus.type !== current.type) {
      elements.type.textContent = String(current.type);
      prevStatus.type = current.type;
    }
    if (prevStatus.kpm !== current.kpm) {
      elements.kpm.textContent = String(current.kpm);
      prevStatus.kpm = current.kpm;
    }
    if (prevStatus.rank !== current.rank) {
      elements.rank.textContent = String(current.rank);
      prevStatus.rank = current.rank;
    }
    if (prevStatus.point !== current.point) {
      elements.point.textContent = String(current.point);
      prevStatus.point = current.point;
    }
    if (prevStatus.miss !== current.miss) {
      elements.miss.textContent = String(current.miss);
      prevStatus.miss = current.miss;
    }
    if (prevStatus.lost !== current.lost) {
      elements.lost.textContent = String(current.lost);
      prevStatus.lost = current.lost;
    }
    if (prevStatus.line !== current.line) {
      elements.line.textContent = String(current.line);
      prevStatus.line = current.line;
    }
    if (prevStatus.timeBonus !== current.timeBonus) {
      elements.timeBonus.textContent = current.timeBonus === 0 ? "" : `+${String(current.timeBonus)}`;
      prevStatus.timeBonus = current.timeBonus;
    }
  });
});

const resetStatusCache = () => {
  prevStatus.score = -1;
  prevStatus.type = -1;
  prevStatus.kpm = -1;
  prevStatus.rank = -1;
  prevStatus.point = -1;
  prevStatus.miss = -1;
  prevStatus.lost = -1;
  prevStatus.line = -1;
  prevStatus.timeBonus = -1;
};
