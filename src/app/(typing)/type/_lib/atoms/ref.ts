import type { ExtractAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import type { TypeResult } from "@/validator/result";
import type { InputMode } from "../type";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const lineCountAtom = atomWithReset(0);
export const readLineCount = () => store.get(lineCountAtom);
export const writeLineCount = (count: number) => store.set(lineCountAtom, count);
export const resetLineCount = () => store.set(lineCountAtom, RESET);

const substatusRefAtom = atomWithReset({
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

export const readSubstatus = () => store.get(substatusRefAtom);
export const writeSubstatus = (newSubstatus: Partial<ExtractAtomValue<typeof substatusRefAtom>>) =>
  store.set(substatusRefAtom, (prev) => ({ ...prev, ...newSubstatus }));
export const resetSubstatus = () => store.set(substatusRefAtom, RESET);

export const lineSubstatusRefAtom = atomWithReset({
  type: 0,
  miss: 0,
  latency: 0,
  types: [] as TypeResult[],
  startSpeed: 1,
  startInputMode: "roma" as InputMode,
  isCompleted: false,
  rkpm: 0,
});

export const readLineSubstatus = () => store.get(lineSubstatusRefAtom);
export const writeLineSubstatus = (newLineSubstatus: Partial<ExtractAtomValue<typeof lineSubstatusRefAtom>>) =>
  store.set(lineSubstatusRefAtom, (prev) => ({ ...prev, ...newLineSubstatus }));
export const resetLineSubstatus = () => store.set(lineSubstatusRefAtom, RESET);

const userStatsRefAtom = atomWithReset({
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

export const readUserStats = () => store.get(userStatsRefAtom);
export const writeUserStats = (newUserStats: Partial<ExtractAtomValue<typeof userStatsRefAtom>>) =>
  store.set(userStatsRefAtom, (prev) => ({ ...prev, ...newUserStats }));
export const resetUserStats = () => store.set(userStatsRefAtom, RESET);

export const utilityRefParamsAtom = atomWithReset({
  isRetrySkip: false,
  retryCount: 1,
  timeOffset: 0,
  startPlaySpeed: 1,
  replayKeyCount: 0,
  rankingScores: [] as number[],
  isOptionEdited: false,
});

export const readUtilityRefParams = () => store.get(utilityRefParamsAtom);
export const writeUtilityRefParams = (newUserStats: Partial<ExtractAtomValue<typeof utilityRefParamsAtom>>) =>
  store.set(utilityRefParamsAtom, (prev) => ({ ...prev, ...newUserStats }));
export const resetUtilityRefParams = () => store.set(utilityRefParamsAtom, RESET);

export const lineProgressAtom = atomWithReset<HTMLProgressElement | null>(null);
export const readLineProgress = () => store.get(lineProgressAtom);
export const writeLineProgress = (newYTPlayer: HTMLProgressElement) => store.set(lineProgressAtom, newYTPlayer);
export const setLineProgressValue = (value: number) => {
  requestDebouncedAnimationFrame("line-progress", () => {
    const lineProgress = store.get(lineProgressAtom);
    if (lineProgress) {
      lineProgress.value = value;
    }
  });
};

const totalProgressAtom = atomWithReset<HTMLProgressElement | null>(null);
export const readTotalProgress = () => store.get(totalProgressAtom);
export const writeTotalProgress = (newYTPlayer: HTMLProgressElement) => store.set(totalProgressAtom, newYTPlayer);
export const setTotalProgressValue = (value: number) => {
  requestDebouncedAnimationFrame("total-progress", () => {
    const totalProgress = store.get(totalProgressAtom);
    if (totalProgress) {
      totalProgress.value = value;
    }
  });
};

const lineResultCardsAtom = atomWithReset<HTMLDivElement[]>([]);
export const readResultCards = () => store.get(lineResultCardsAtom);
export const writeResultCards = (newCards: HTMLDivElement[]) => store.set(lineResultCardsAtom, newCards);
