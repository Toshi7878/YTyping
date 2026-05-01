import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { BuiltImeLine, WordResult } from "lyrics-ime-typing-engine";
import type { Updater } from "@/utils/types";
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

const typingWordAtom = atomWithReset({
  expectedWords: [] as string[][][],
  currentWordIndex: 0,
});

const expectedWordsAtom = focusAtom(typingWordAtom, (optic) => optic.prop("expectedWords"));
const currentWordIndexAtom = focusAtom(typingWordAtom, (optic) => optic.prop("currentWordIndex"));

export const getTypingWord = () => store.get(typingWordAtom);
export const setExpectedWords = (newExpectedWords: ExtractAtomValue<typeof expectedWordsAtom>) =>
  store.set(expectedWordsAtom, newExpectedWords);
export const useCurrentWordIndexState = () => useAtomValue(currentWordIndexAtom);
export const setCurrentWordIndex = (newCurrentWordIndex: number) =>
  store.set(currentWordIndexAtom, newCurrentWordIndex);
export const resetTypingWord = () => store.set(typingWordAtom, RESET);

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

const statusAtom = atomWithReset({ typeCount: 0, score: 0 });
export const useStatusState = () => useAtomValue(statusAtom);
export const setStatus = (update: Updater<ExtractAtomValue<typeof statusAtom>>) => store.set(statusAtom, update);
export const resetStatus = () => store.set(statusAtom, RESET);
export const readStatus = () => store.get(statusAtom);

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
