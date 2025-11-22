import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { DEFAULT_IME_OPTIONS } from "@/server/drizzle/schema";
import type { Updater } from "@/utils/types";
import { DISPLAY_LINE_LENGTH } from "../const";
import type { BuiltImeMap, PlaceholderType, SceneType, WordResults } from "../type";
import { getImeAtomStore } from "./store";

const store = getImeAtomStore();

const builtMapAtom = atomWithReset<BuiltImeMap | null>(null);
export const useBuiltMapState = () => useAtomValue(builtMapAtom, { store });
export const setBuiltMap = (map: BuiltImeMap) => store.set(builtMapAtom, map);
export const resetBuiltMap = () => store.set(builtMapAtom, RESET);
export const readBuiltMap = () => store.get(builtMapAtom);

const sceneAtom = atomWithReset<SceneType>("ready");
export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const setScene = (newScene: SceneType) => store.set(sceneAtom, newScene);
export const resetScene = () => store.set(sceneAtom, RESET);
export const readScene = () => store.get(sceneAtom);

const utilityParamsAtom = atomWithReset({
  skipRemainTime: null as number | null,
  count: 0,
  wipeCount: 0,
  displayLines: new Array(DISPLAY_LINE_LENGTH).fill([]) as BuiltImeMap["lines"][number][],
  nextDisplayLine: [] as BuiltImeMap["lines"][number],
  judgedWords: [] as string[][][],
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
const judgedWordsAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("judgedWords"));
const textareaPlaceholderTypeAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("textareaPlaceholderType"));

export const useCountState = () => useAtomValue(countAtom, { store });
export const useSkipRemainTimeState = () => useAtomValue(skipRemainTimeAtom, { store });
export const useDisplayLinesState = () => useAtomValue(displayLinesAtom, { store });
export const useNextDisplayLineState = () => useAtomValue(nextDisplayLineAtom, { store });
export const useTextareaPlaceholderTypeState = () => useAtomValue(textareaPlaceholderTypeAtom, { store });

export const setSkipRemainTime = (time: number | null) => store.set(skipRemainTimeAtom, time);
export const setWipeCount = (wipeCount: number) => store.set(wipeCountAtom, wipeCount);
export const setCount = (count: number) => store.set(countAtom, count);
export const setDisplayLines = (lines: ExtractAtomValue<typeof displayLinesAtom>) => store.set(displayLinesAtom, lines);
export const setNextDisplayLine = (nextLine: ExtractAtomValue<typeof nextDisplayLineAtom>) =>
  store.set(nextDisplayLineAtom, nextLine);
export const setJudgedWords = (judgedWords: ExtractAtomValue<typeof judgedWordsAtom>) =>
  store.set(judgedWordsAtom, judgedWords);
export const setTextareaPlaceholderType = (type: ExtractAtomValue<typeof textareaPlaceholderTypeAtom>) =>
  store.set(textareaPlaceholderTypeAtom, type);

const statusAtom = atomWithReset({ typeCount: 0, score: 0, wordIndex: 0 });
export const useStatusState = () => useAtomValue(statusAtom, { store });
export const setStatus = (update: Updater<ExtractAtomValue<typeof statusAtom>>) => store.set(statusAtom, update);
export const resetStatus = () => store.set(statusAtom, RESET);
export const readStatus = () => store.get(statusAtom);

const wordResultsAtom = atomWithReset([] as WordResults);

export const useWordResultsState = () => useAtomValue(wordResultsAtom, { store });
export const readWordResults = () => store.get(wordResultsAtom);

export const initializeResultsFromMap = () => {
  const map = store.get(builtMapAtom);
  if (map) {
    store.set(wordResultsAtom, map.initWordResults);
  }
};
export const setWordResults = (updateResult: { index: number; result: WordResults[number] }) => {
  const { index, result } = updateResult;

  store.set(wordResultsAtom, (prev) => {
    const newResults = [...prev];

    if (newResults[index]) {
      newResults[index] = result;
    }
    return newResults;
  });
};

const notificationsAtom = atomWithReset<string[]>([]);

export const useNotificationsState = () => useAtomValue(notificationsAtom, { store });
export const setNotifications = (update: Updater<ExtractAtomValue<typeof notificationsAtom>>) =>
  store.set(notificationsAtom, update);
export const resetNotifications = () => store.set(notificationsAtom, RESET);

const resultDialogAtom = atom(false);

export const useIsResultDialogOpen = () => useAtomValue(resultDialogAtom, { store });
export const resultDialogOpen = () => store.set(resultDialogAtom, true);
export const resultDialogClose = () => store.set(resultDialogAtom, false);

const isImeTypeOptionsEditedAtom = atom(false);
export const imeTypeOptionsAtom = atomWithReset(DEFAULT_IME_OPTIONS);

const enableNextLyricsOptionAtom = focusAtom(imeTypeOptionsAtom, (optic) => optic.prop("enableNextLyrics"));
const enableLargeVideoDisplayAtom = focusAtom(imeTypeOptionsAtom, (optic) => optic.prop("enableLargeVideoDisplay"));

store.sub(imeTypeOptionsAtom, () => {
  store.set(isImeTypeOptionsEditedAtom, true);
});

export const readIsImeTypeOptionsEdited = () => store.get(isImeTypeOptionsEditedAtom);

export const useImeTypeOptionsState = () => useAtomValue(imeTypeOptionsAtom, { store });
export const readImeTypeOptions = () => store.get(imeTypeOptionsAtom);

export const useEnableNextLyricsOptionState = () => useAtomValue(enableNextLyricsOptionAtom, { store });
export const useEnableLargeVideoDisplayState = () => useAtomValue(enableLargeVideoDisplayAtom, { store });
export const setImeOptions = (newOptions: Partial<ExtractAtomValue<typeof imeTypeOptionsAtom>>) => {
  store.set(imeTypeOptionsAtom, (prev) => ({
    ...prev,
    ...newOptions,
  }));
};
