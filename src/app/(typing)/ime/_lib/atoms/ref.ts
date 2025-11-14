import { atom, type ExtractAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { Updater } from "@/utils/types";
import { getImeAtomStore } from "./store";

const store = getImeAtomStore();

const lyricsContainerAtom = atom<HTMLDivElement | null>(null);
export const readLyricsContainer = () => store.get(lyricsContainerAtom);
export const writeLyricsContainer = (element: HTMLDivElement) => store.set(lyricsContainerAtom, element);

const inputTextareaAtom = atom<HTMLTextAreaElement | null>(null);

export const readTypingTextarea = () => store.get(inputTextareaAtom);
export const writeTypingTextarea = (element: HTMLTextAreaElement) => store.set(inputTextareaAtom, element);

const userStatsAtom = atomWithReset({ imeTypeCount: 0, typingTime: 0 });
const typingTimeStatsAtom = focusAtom(userStatsAtom, (optic) => optic.prop("typingTime"));
const imeTypeCountStatsAtom = focusAtom(userStatsAtom, (optic) => optic.prop("imeTypeCount"));

export const updateTypingTimeStats = (update: Updater<ExtractAtomValue<typeof typingTimeStatsAtom>>) => {
  store.set(typingTimeStatsAtom, update);
};
export const updateImeTypeCountStats = (update: Updater<ExtractAtomValue<typeof imeTypeCountStatsAtom>>) => {
  store.set(imeTypeCountStatsAtom, update);
};
export const readUserStats = () => store.get(userStatsAtom);
export const resetUserStats = () => store.set(userStatsAtom, RESET);
