import type { ExtractAtomValue} from "jotai";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const timeOffsetAtom = atomWithStorage("editor_playing_time_offset", -0.2, undefined, {
  getOnInit: true,
});

export const useTimeOffsetState = () => useAtomValue(timeOffsetAtom, { store });
export const useSetTimeOffset = () => useSetAtom(timeOffsetAtom, { store });
export const useReadTimeOffsetState = () => {
  return useAtomCallback(
    useCallback((get) => get(timeOffsetAtom), []),
    { store },
  );
};

const wordConvertOptionAtom = atomWithStorage<"non_symbol" | "add_symbol" | "add_symbol_all">(
  "edit-word-convert-option",
  "non_symbol",
  undefined,
  {
    getOnInit: true,
  },
);
export type ConvertOption = ExtractAtomValue<typeof wordConvertOptionAtom>;

export const useWordConvertOptionState = () => useAtomValue(wordConvertOptionAtom, { store });
export const useSetWordConvertOption = () => useSetAtom(wordConvertOptionAtom, { store });
export const useReadWordConvertOption = () => {
  return useAtomCallback(
    useCallback((get) => get(wordConvertOptionAtom), []),
    { store },
  );
};
