import { useAtomValue } from "jotai";
import { atom } from "jotai/vanilla";
import { uncontrolled } from "jotai-uncontrolled";
import { builtMapAtom, getBuiltMap } from "@/app/(typing)/type/_feature/atoms/built-map";
import { findClosestLowerOrEqual } from "@/utils/array";
import { store } from "../atoms/store";

const lineStyleIndexAtom = atom<number | null>(null);
const lineStyleAtom = atom((get): string => {
  const lineStyleIndex = get(lineStyleIndexAtom);
  if (lineStyleIndex === null) return "";
  const map = getBuiltMap();
  if (!map) return "";
  return map.lines[lineStyleIndex]?.options?.changeCSS ?? "";
});
export const resetLineStyleIndex = () => store.set(lineStyleIndexAtom, null);
export const setLineCustomStyleIndex = (currentIndex: number) => {
  const map = getBuiltMap();
  if (!map) return;
  if (map.changeCSSIndexes.length === 0) {
    store.set(lineStyleIndexAtom, null);
    return;
  }

  store.set(lineStyleIndexAtom, findClosestLowerOrEqual(map.changeCSSIndexes, currentIndex));
};

export const isStyledMapAtom = atom((get): boolean => {
  const map = get(builtMapAtom);
  if (!map) return false;
  return map.changeCSSIndexes.length > 0 || !!map.lines[0]?.options?.eternalCSS;
});
export const useIsStyledMap = () => useAtomValue(isStyledMapAtom);

const isDisabledMapStyledAtom = atom(false);
export const useIsDisabledMapStyled = () => useAtomValue(isDisabledMapStyledAtom);
export const setIsDisabledMapStyled = (value: boolean) => store.set(isDisabledMapStyledAtom, value);

export const LineCustomStyle = () => {
  const isDisabledMapStyled = useIsDisabledMapStyled();
  if (isDisabledMapStyled) return null;
  return <uncontrolled.style atomStore={store}>{lineStyleAtom}</uncontrolled.style>;
};

export const EternalCustomStyle = () => {
  const map = getBuiltMap();
  const isDisabledMapStyled = useIsDisabledMapStyled();

  if (!map || isDisabledMapStyled) return null;
  if (!map.lines[0]?.options?.eternalCSS) return null;

  return <style>{map.lines[0].options?.eternalCSS}</style>;
};
