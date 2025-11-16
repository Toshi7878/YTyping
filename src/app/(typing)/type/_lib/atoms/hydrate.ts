import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { RouterOutPuts } from "@/server/api/trpc";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";
import { writeUtilityRefParams } from "./ref";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

export const mapInfoAtom = atomWithReset<RouterOutPuts["map"]["getMapInfo"] | null>(null);
export const useMapInfoState = () => useAtomValue(mapInfoAtom, { store });
export const readMapInfo = () => store.get(mapInfoAtom);
export const setMapInfo = (value: ExtractAtomValue<typeof mapInfoAtom>) => store.set(mapInfoAtom, value);
export const readMapId = () => store.get(mapInfoAtom)?.id ?? null;

export const typingOptionsAtom = atomWithReset(DEFAULT_TYPING_OPTIONS);
export const useTypingOptionsState = () => useAtomValue(typingOptionsAtom, { store });
export const readTypingOptions = () => store.get(typingOptionsAtom);
export const setTypingOptions = (newTypingOptions: Partial<ExtractAtomValue<typeof typingOptionsAtom>>) => {
  store.set(typingOptionsAtom, (prev) => ({ ...prev, ...newTypingOptions }));
  writeUtilityRefParams({ isOptionEdited: true });
};
export const resetTypingOptions = () => {
  store.set(typingOptionsAtom, RESET);
  writeUtilityRefParams({ isOptionEdited: true });
};
