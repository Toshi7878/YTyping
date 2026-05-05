import { atom, type ExtractAtomValue, type SetStateAction } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { store } from "../../_feature/provider";

const lyricsContainerAtom = atom<HTMLDivElement | null>(null);
export const readLyricsContainer = () => store.get(lyricsContainerAtom);
export const writeLyricsContainer = (element: HTMLDivElement) => store.set(lyricsContainerAtom, element);

const inputTextareaAtom = atom<HTMLTextAreaElement | null>(null);
export const readTypingTextarea = () => store.get(inputTextareaAtom);
export const writeTypingTextarea = (element: HTMLTextAreaElement) => store.set(inputTextareaAtom, element);

const imeStatsAtom = atomWithReset({ imeTypeCount: 0, typingTime: 0 });
export type ImeStats = ExtractAtomValue<typeof imeStatsAtom>;
const imeTimeStatsAtom = focusAtom(imeStatsAtom, (optic) => optic.prop("typingTime"));
const imeTypeCountStatsAtom = focusAtom(imeStatsAtom, (optic) => optic.prop("imeTypeCount"));

export const updateTypingTimeStats = (update: SetStateAction<ExtractAtomValue<typeof imeTimeStatsAtom>>) => {
  store.set(imeTimeStatsAtom, update);
};
export const updateImeTypeCountStats = (update: SetStateAction<ExtractAtomValue<typeof imeTypeCountStatsAtom>>) => {
  store.set(imeTypeCountStatsAtom, update);
};
export const readImeStats = () => store.get(imeStatsAtom);
export const resetImeStats = () => store.set(imeStatsAtom, RESET);
