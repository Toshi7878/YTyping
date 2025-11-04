import type { ExtractAtomValue } from "jotai";
import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const timeOffsetAtom = atomWithStorage("editor_playing_time_offset", -0.2, undefined, {
  getOnInit: true,
});

export const useTimeOffsetState = () => useAtomValue(timeOffsetAtom, { store });
export const setTimeOffset = (value: ExtractAtomValue<typeof timeOffsetAtom>) => store.set(timeOffsetAtom, value);
export const readTimeOffset = () => store.get(timeOffsetAtom);

const wordConvertOptionAtom = atomWithStorage<"non_symbol" | "add_symbol" | "add_symbol_all">(
  "edit-word-convert-option",
  "non_symbol",
  undefined,
  { getOnInit: true },
);
export type ConvertOption = ExtractAtomValue<typeof wordConvertOptionAtom>;

export const useWordConvertOptionState = () => useAtomValue(wordConvertOptionAtom, { store });
export const setWordConvertOption = (value: ExtractAtomValue<typeof wordConvertOptionAtom>) =>
  store.set(wordConvertOptionAtom, value);
export const readWordConvertOption = () => store.get(wordConvertOptionAtom);
