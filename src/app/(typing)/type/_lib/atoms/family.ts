import deepEqual from "fast-deep-equal";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
import type { ResultData } from "@/server/drizzle/validator/result";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const lineResultAtomFamily = atomFamily(
  () => atom<{ isSelected: boolean; lineResult: ResultData[number] } | undefined>(),
  deepEqual,
);
export const getLineResultAtomByIndex = (index: number) => lineResultAtomFamily(index);

export const useLineResultState = (index: number) => useAtomValue(lineResultAtomFamily(index), { store });
export const setLineResult = ({ index, lineResult }: { index: number; lineResult: ResultData[number] }) => {
  const prev = store.get(lineResultAtomFamily(index));
  if (!prev) return;
  store.set(lineResultAtomFamily(index), { ...prev, lineResult });
};
export const readAllLineResult = (): ResultData => {
  const results: ResultData = [];
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
export const initializeAllLineResult = (initResultData: ResultData) => {
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
