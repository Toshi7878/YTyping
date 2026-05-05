import deepEqual from "fast-deep-equal";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai-family";
import type { TypingLineResult } from "@/validator/result/result";
import { getBuiltMap } from "./built-map";
import { store } from "./store";

const lineResultAtomFamily = atomFamily(
  () => atom<{ isSelected: boolean; lineResult: TypingLineResult } | undefined>(),
  deepEqual,
);

export const useLineResultState = (index: number) => useAtomValue(lineResultAtomFamily(index));
export const setLineResult = ({ index, lineResult }: { index: number; lineResult: TypingLineResult }) => {
  const prev = store.get(lineResultAtomFamily(index));
  if (!prev) return;
  store.set(lineResultAtomFamily(index), { ...prev, lineResult });
};
const setLineResultSelected = ({ index, isSelected }: { index: number; isSelected: boolean }) => {
  const target = store.get(lineResultAtomFamily(index));
  if (!target) return;
  store.set(lineResultAtomFamily(index), { ...target, isSelected });
};

export const getAllLineResult = (): TypingLineResult[] => {
  const results: TypingLineResult[] = [];
  let index = 0;

  while (true) {
    const atom = lineResultAtomFamily(index);
    const result = store.get(atom);

    if (result !== undefined) {
      results.push(result.lineResult);
      index++;
    } else {
      break;
    }
  }

  return results;
};
export const initializeAllLineResult = (initLineResults: TypingLineResult[]) => {
  initLineResults.forEach((lineResult, index) => {
    store.set(lineResultAtomFamily(index), { isSelected: false, lineResult });
  });
};
export const clearAllLineResult = () => {
  let index = 0;
  while (true) {
    const atom = lineResultAtomFamily(index);
    const result = store.get(atom);
    if (result !== undefined) {
      lineResultAtomFamily.remove(index);
      index++;
    } else {
      break;
    }
  }
};

const lineSelectIndexAtom = atom(0);
export const resetLineSelectIndex = () => store.set(lineSelectIndexAtom, 0);
export const useSelectLineIndexState = () => useAtomValue(lineSelectIndexAtom);
export const getSelectLineIndex = () => store.get(lineSelectIndexAtom);
export const setSelectLineIndex = (lineIndex: number) => {
  const map = getBuiltMap();
  if (!map) return;

  const count = map.typingLineIndexes[lineIndex - 1];
  if (count === undefined) return;

  const prevSelectedIndex = store.get(lineSelectIndexAtom);
  if (prevSelectedIndex !== null && prevSelectedIndex !== lineIndex) {
    const prevCount = map.typingLineIndexes[prevSelectedIndex - 1];
    if (prevCount !== undefined) {
      setLineResultSelected({ index: prevCount, isSelected: false });
    }
  }

  store.set(lineSelectIndexAtom, lineIndex);
  setLineResultSelected({ index: count, isSelected: true });
};
