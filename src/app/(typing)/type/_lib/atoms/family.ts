import deepEqual from "fast-deep-equal";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai-family";
import type { TypingLineResults } from "@/validator/result";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const lineResultAtomFamily = atomFamily(
  () => atom<{ isSelected: boolean; lineResult: TypingLineResults[number] } | undefined>(),
  deepEqual,
);

export const useLineResultState = (index: number) => useAtomValue(lineResultAtomFamily(index), { store });
export const setLineResult = ({ index, lineResult }: { index: number; lineResult: TypingLineResults[number] }) => {
  const prev = store.get(lineResultAtomFamily(index));
  if (!prev) return;
  store.set(lineResultAtomFamily(index), { ...prev, lineResult });
};
export const setLineResultSelected = ({ index, isSelected }: { index: number; isSelected: boolean }) => {
  const target = store.get(lineResultAtomFamily(index));
  if (!target) return;
  store.set(lineResultAtomFamily(index), { ...target, isSelected });
};
export const readAllLineResult = (): TypingLineResults => {
  const results: TypingLineResults = [];
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
export const initializeAllLineResult = (initResultData: TypingLineResults) => {
  initResultData.forEach((lineResult, index) => {
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
