import { useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { ConvertOptionsType } from "../ts/type";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const timeOffsetAtom = atomWithStorage("editor_playing_time_offset", -0.2, undefined, {
  getOnInit: true,
});

export const useTimeOffsetState = () => useAtomValue(timeOffsetAtom, { store });
export const useSetTimeOffsetState = () => useSetAtom(timeOffsetAtom, { store });
export const useTimeOffsetStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(timeOffsetAtom), []),
    { store }
  );
};

export const wordConvertOptionAtom = atomWithStorage<ConvertOptionsType>(
  "edit-word-convert-option",
  "non_symbol",
  undefined,
  {
    getOnInit: true,
  }
);

export const useWordConvertOptionState = () => useAtomValue(wordConvertOptionAtom, { store });
export const useSetWordConvertOptionState = () => useSetAtom(wordConvertOptionAtom, { store });
export const useWordConvertOptionStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(wordConvertOptionAtom), []),
    { store }
  );
};
