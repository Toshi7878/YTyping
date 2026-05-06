import deepEqual from "fast-deep-equal";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import type { TypingLineResult } from "@/validator/result/result";
import { getBuiltMap } from "./built-map";
import { store } from "./store";

type LineResultState = {
  isSelected: boolean;
  lineResult: TypingLineResult;
};

const lineResultsAtom = atom<LineResultState[]>([]);

export const useLineResultByIndex = (index: number) =>
  useAtomValue(selectAtom(lineResultsAtom, (lineResults) => lineResults[index], deepEqual));
export const setLineResultByIndex = ({ index, lineResult }: { index: number; lineResult: TypingLineResult }) => {
  store.set(lineResultsAtom, (prev) => {
    const target = prev[index];
    if (!target) return prev;

    return prev.map((item, i) => (i === index ? { ...item, lineResult } : item));
  });
};
const setLineResultSelectedByIndex = ({ index, isSelected }: { index: number; isSelected: boolean }) => {
  store.set(lineResultsAtom, (prev) => {
    const target = prev[index];
    if (!target) return prev;

    return prev.map((item, i) => (i === index ? { ...item, isSelected } : item));
  });
};

export const getLineResults = (): TypingLineResult[] => {
  return store.get(lineResultsAtom).map((result) => result.lineResult);
};
export const getLineResultByIndex = (index: number): TypingLineResult | undefined => {
  return store.get(lineResultsAtom)[index]?.lineResult;
};
export const setInitialLineResults = (initLineResults: TypingLineResult[]) => {
  store.set(
    lineResultsAtom,
    initLineResults.map((lineResult) => ({ isSelected: false, lineResult })),
  );
};
export const resetLineResults = () => {
  store.set(lineResultsAtom, []);
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
      setLineResultSelectedByIndex({ index: prevCount, isSelected: false });
    }
  }

  store.set(lineSelectIndexAtom, lineIndex);
  setLineResultSelectedByIndex({ index: count, isSelected: true });
};
