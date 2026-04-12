import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { InputMode } from "lyrics-typing-engine";
import type { TypeResult } from "@/validator/result";
import { getTypingGameAtomStore } from "./store";

const store = getTypingGameAtomStore();

const lineCountAtom = atomWithReset(0);
export const readLineCount = () => store.get(lineCountAtom);
export const writeLineCount = (count: number) => store.set(lineCountAtom, count);
export const resetLineCount = () => store.set(lineCountAtom, RESET);

const typingSubstatusAtom = atomWithReset({
  romaType: 0,
  kanaType: 0,
  flickType: 0,
  englishType: 0,
  spaceType: 0,
  symbolType: 0,
  numType: 0,
  rkpm: 0,
  clearRate: 100,
  kanaToRomaConvertCount: 0,
  maxCombo: 0,
  missCombo: 0,
  totalTypeTime: 0,
  totalLatency: 0,
  completeCount: 0,
  failureCount: 0,
});

export type TypingSubstatus = ExtractAtomValue<typeof typingSubstatusAtom>;
export const readTypingSubstatus = () => store.get(typingSubstatusAtom);
export const writeTypingSubstatus = (newSubstatus: Partial<TypingSubstatus>) =>
  store.set(typingSubstatusAtom, (prev) => ({ ...prev, ...newSubstatus }));
export const resetTypingSubstatus = () => store.set(typingSubstatusAtom, RESET);

const lineCompleteCountAtom = focusAtom(typingSubstatusAtom, (optic) => optic.prop("completeCount"));
const lineFailureCountAtom = focusAtom(typingSubstatusAtom, (optic) => optic.prop("failureCount"));

export const useLineCompleteCountState = () => useAtomValue(lineCompleteCountAtom);
export const useLineFailureCountState = () => useAtomValue(lineFailureCountAtom);

const lineSubstatusRefAtom = atomWithReset({
  typeCount: 0,
  missCount: 0,
  latency: 0,
  types: [] as TypeResult[],
  startSpeed: 1,
  startInputMode: "roma" as InputMode,
  rkpm: 0,
});

export const readLineSubstatus = () => store.get(lineSubstatusRefAtom);
export const writeLineSubstatus = (newLineSubstatus: Partial<ExtractAtomValue<typeof lineSubstatusRefAtom>>) =>
  store.set(lineSubstatusRefAtom, (prev) => ({ ...prev, ...newLineSubstatus }));
export const resetLineSubstatus = () => store.set(lineSubstatusRefAtom, RESET);

const typingStatsRefAtom = atomWithReset({
  romaType: 0,
  kanaType: 0,
  flickType: 0,
  englishType: 0,
  spaceType: 0,
  symbolType: 0,
  numType: 0,
  typingTime: 0,
  maxCombo: 0,
});
export type TypingStats = ExtractAtomValue<typeof typingStatsRefAtom>;

export const readTypingStats = () => store.get(typingStatsRefAtom);
export const writeTypingStats = (newUserStats: Partial<TypingStats>) =>
  store.set(typingStatsRefAtom, (prev) => ({ ...prev, ...newUserStats }));
export const resetTypingStats = () => store.set(typingStatsRefAtom, RESET);

const utilityRefParamsAtom = atomWithReset({
  isRetrySkip: false,
  retryCount: 1,
  timeOffset: 0,
  startPlaySpeed: 1,
  replayKeyCount: 0,
  rankingScores: [] as number[],
  isOptionEdited: false,
});

export const getUtilityRefParams = () => store.get(utilityRefParamsAtom);
export const writeUtilityRefParams = (newUserStats: Partial<ExtractAtomValue<typeof utilityRefParamsAtom>>) =>
  store.set(utilityRefParamsAtom, (prev) => ({ ...prev, ...newUserStats }));
export const resetUtilityRefParams = () => store.set(utilityRefParamsAtom, RESET);

const practiceLineListItemsAtom = atomWithReset<HTMLElement[]>([]);
export const readPracticeLineItems = () => store.get(practiceLineListItemsAtom);
export const writePracticeLineItems = (newItems: HTMLElement[]) => store.set(practiceLineListItemsAtom, newItems);
