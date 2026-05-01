import type { ExtractAtomValue, SetStateAction } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { BuiltImeLine, WordResult } from "lyrics-ime-typing-engine";
import { store } from "../../_feature/provider";
import { DISPLAY_LINE_LENGTH } from "../const";
import type { PlaceholderType, SceneType } from "../type";

const builtMapAtom = atomWithReset<{
  lines: BuiltImeLine[];
  words: string[][][][];
  totalNotes: number;
  initWordResults: WordResult[];
  flatWords: string[];
} | null>(null);
export const useBuiltMapState = () => useAtomValue(builtMapAtom);
export const setBuiltMap = (map: ExtractAtomValue<typeof builtMapAtom>) => store.set(builtMapAtom, map);
export const resetBuiltMap = () => store.set(builtMapAtom, RESET);
export const getBuiltMap = () => store.get(builtMapAtom);

const sceneAtom = atomWithReset<SceneType>("ready");
export const useSceneState = () => useAtomValue(sceneAtom);
export const setScene = (newScene: SceneType) => store.set(sceneAtom, newScene);
export const resetScene = () => store.set(sceneAtom, RESET);
export const readScene = () => store.get(sceneAtom);

const targetWordsAtom = atom<string[][][]>([]);

export const getTargetWords = () => store.get(targetWordsAtom);
export const setTargetWords = (newExpectedWords: ExtractAtomValue<typeof targetWordsAtom>) =>
  store.set(targetWordsAtom, newExpectedWords);
export const resetTypingWord = () => store.set(targetWordsAtom, []);

const currentWordIndexAtom = atom(0);
export const useCurrentWordIndexState = () => useAtomValue(currentWordIndexAtom);
export const getCurrentWordIndex = () => store.get(currentWordIndexAtom);
export const setCurrentWordIndex = (newCurrentWordIndex: number) =>
  store.set(currentWordIndexAtom, newCurrentWordIndex);

const utilityParamsAtom = atomWithReset({
  skipRemainTime: null as number | null,
  count: 0,
  wipeCount: 0,
  displayLines: new Array(DISPLAY_LINE_LENGTH).fill([]) as BuiltImeLine[],
  nextDisplayLine: [] as BuiltImeLine,
  textareaPlaceholderType: "normal" as PlaceholderType,
});

export const readUtilityParams = () => store.get(utilityParamsAtom);
export const readWipeLine = () => {
  const displayLines = store.get(displayLinesAtom);
  return displayLines[displayLines.length - 1];
};

export const resetUtilityParams = () => store.set(utilityParamsAtom, RESET);

const skipRemainTimeAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("skipRemainTime"));
const countAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("count"));
const wipeCountAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("wipeCount"));
const displayLinesAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("displayLines"));
const nextDisplayLineAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("nextDisplayLine"));
const textareaPlaceholderTypeAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("textareaPlaceholderType"));

export const useCountState = () => useAtomValue(countAtom);
export const useSkipRemainTimeState = () => useAtomValue(skipRemainTimeAtom);
export const useDisplayLinesState = () => useAtomValue(displayLinesAtom);
export const useNextDisplayLineState = () => useAtomValue(nextDisplayLineAtom);
export const useTextareaPlaceholderTypeState = () => useAtomValue(textareaPlaceholderTypeAtom);

export const setSkipRemainTime = (time: number | null) => store.set(skipRemainTimeAtom, time);
export const setWipeCount = (wipeCount: number) => store.set(wipeCountAtom, wipeCount);
export const setCount = (count: number) => store.set(countAtom, count);
export const setDisplayLines = (lines: ExtractAtomValue<typeof displayLinesAtom>) => store.set(displayLinesAtom, lines);
export const setNextDisplayLine = (nextLine: ExtractAtomValue<typeof nextDisplayLineAtom>) =>
  store.set(nextDisplayLineAtom, nextLine);

export const setTextareaPlaceholderType = (type: ExtractAtomValue<typeof textareaPlaceholderTypeAtom>) =>
  store.set(textareaPlaceholderTypeAtom, type);

const typeCountAtom = atom(0);
const scoreAtom = atom((get) => {
  const typeCount = get(typeCountAtom);
  const map = get(builtMapAtom);
  if (!map) return 0;

  return Math.round((1000 / map.totalNotes) * typeCount);
});

export const useTypeCountState = () => useAtomValue(typeCountAtom);
export const getTypeCount = () => store.get(typeCountAtom);
export const setTypeCount = (updater: SetStateAction<number>) => store.set(typeCountAtom, updater);
export const resetTypeCount = () => store.set(typeCountAtom, 0);

export const useScoreState = () => useAtomValue(scoreAtom);
export const getScore = () => store.get(scoreAtom);

const wordResultsAtom = atomWithReset([] as WordResult[]);

export const useWordResultsState = () => useAtomValue(wordResultsAtom);
export const readWordResults = () => store.get(wordResultsAtom);

export const initializeResultsFromMap = () => {
  const map = store.get(builtMapAtom);
  if (map) {
    store.set(wordResultsAtom, map.initWordResults);
  }
};
export const setWordResults = (updateResult: { index: number; result: WordResult }) => {
  const { index, result } = updateResult;

  store.set(wordResultsAtom, (prev) => {
    const newResults = [...prev];

    if (newResults[index]) {
      newResults[index] = result;
    }
    return newResults;
  });
};

const resultDialogAtom = atom(false);

export const useIsResultDialogOpen = () => useAtomValue(resultDialogAtom);
export const resultDialogOpen = () => store.set(resultDialogAtom, true);
export const resultDialogClose = () => store.set(resultDialogAtom, false);
