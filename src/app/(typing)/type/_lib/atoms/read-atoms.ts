import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import type { TypeResult } from "@/server/drizzle/validator/result";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import type { InputMode } from "../type";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const lineCountAtom = atomWithReset(0);

export const useLineCountState = () => useAtomValue(lineCountAtom, { store });
export const useLineCount = () => {
  const readCount = useAtomCallback(
    useCallback((get) => get(lineCountAtom), []),
    { store },
  );
  const writeCount = useAtomCallback(
    useCallback((_get, set, newCount: number) => {
      set(lineCountAtom, newCount);
    }, []),
    { store },
  );

  return { readCount, writeCount };
};

const typingSubstatusRefAtom = atomWithReset({
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

export const useTypingSubstatusReference = () => {
  const readSubstatusRefOnly = useAtomCallback(
    useCallback((get) => get(typingSubstatusRefAtom), []),
    { store },
  );
  const writeStatus = useAtomCallback(
    useCallback((_get, set, newUserStats: Partial<ExtractAtomValue<typeof typingSubstatusRefAtom>>) => {
      set(typingSubstatusRefAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store },
  );

  const resetStatus = useAtomCallback(
    useCallback((_get, set) => {
      set(typingSubstatusRefAtom, RESET);
    }, []),
    { store },
  );

  return { readStatus: readSubstatusRefOnly, writeStatus, resetStatus };
};

export const lineStatusAtom = atomWithReset({
  type: 0,
  miss: 0,
  latency: 0,
  types: [] as TypeResult[],
  startSpeed: 1,
  startInputMode: "roma" as InputMode,
  isCompleted: false,
  rkpm: 0,
});

export const useLineStatus = () => {
  const readLineStatus = useAtomCallback(
    useCallback((get) => get(lineStatusAtom), []),
    { store },
  );
  const writeLineStatus = useAtomCallback(
    useCallback((_get, set, newUserStats: Partial<ExtractAtomValue<typeof lineStatusAtom>>) => {
      set(lineStatusAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store },
  );
  const resetLineStatus = useAtomCallback(
    useCallback((_get, set) => {
      set(lineStatusAtom, RESET);
    }, []),
    { store },
  );

  return { readLineStatus, writeLineStatus, resetLineStatus };
};

const userStatsAtom = atomWithReset({
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

export const useUserStats = () => {
  const readUserStats = useAtomCallback(
    useCallback((get) => get(userStatsAtom), []),
    { store },
  );

  const writeUserStats = useAtomCallback(
    useCallback((_get, set, newUserStats: Partial<ExtractAtomValue<typeof userStatsAtom>>) => {
      set(userStatsAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store },
  );
  const resetUserStats = useAtomCallback(
    useCallback((_get, set, maxCombo = 0) => {
      set(userStatsAtom, RESET);
      set(userStatsAtom, (prev) => ({ ...prev, maxCombo }));
    }, []),
    { store },
  );

  return { readUserStats, writeUserStats, resetUserStats };
};

export const gameUtilityReferenceParamsAtom = atomWithReset({
  isRetrySkip: false,
  retryCount: 1,
  timeOffset: 0,
  startPlaySpeed: 1,
  replayKeyCount: 0,
  replayUserName: "",
  rankingScores: [] as number[],
  isOptionEdited: false,
});

export const useGameUtilityReferenceParams = () => {
  const readGameUtilRefParams = useAtomCallback(
    useCallback((get) => get(gameUtilityReferenceParamsAtom), []),
    { store },
  );
  const writeGameUtilRefParams = useAtomCallback(
    useCallback((_get, set, newGameState: Partial<ExtractAtomValue<typeof gameUtilityReferenceParamsAtom>>) => {
      set(gameUtilityReferenceParamsAtom, (prev) => {
        return { ...prev, ...newGameState };
      });
    }, []),
    { store },
  );
  const resetGameUtilRefParams = useAtomCallback(
    useCallback((_get, set) => {
      set(gameUtilityReferenceParamsAtom, RESET);
    }, []),
    { store },
  );

  return {
    readGameUtilRefParams,
    writeGameUtilRefParams,
    resetGameUtilRefParams,
  };
};

export const playerAtom = atom<YT.Player | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerAtom) as YT.Player, []),
    { store },
  );

  const writePlayer = useAtomCallback(
    useCallback((_get, set, newPlayer: YT.Player | null) => {
      set(playerAtom, newPlayer);
    }, []),
    { store },
  );

  return { readPlayer, writePlayer };
};

export const lineProgressAtom = atom<HTMLProgressElement | null>(null);
const totalProgressAtom = atom<HTMLProgressElement | null>(null);

export const useProgress = () => {
  const readLineProgress = useAtomCallback(
    useCallback((get) => get(lineProgressAtom) as HTMLProgressElement, []),
    { store },
  );
  const readTotalProgress = useAtomCallback(
    useCallback((get) => get(totalProgressAtom) as HTMLProgressElement, []),
    { store },
  );

  const writeLineProgress = useAtomCallback(
    useCallback((_get, set, newProgress: HTMLProgressElement | null) => {
      set(lineProgressAtom, newProgress);
    }, []),
    { store },
  );

  const writeTotalProgress = useAtomCallback(
    useCallback((_get, set, newProgress: HTMLProgressElement | null) => {
      set(totalProgressAtom, newProgress);
    }, []),
    { store },
  );

  const setLineProgressValue = useAtomCallback(
    useCallback((get, _set, value: number) => {
      requestDebouncedAnimationFrame("line-progress", () => {
        const lineProgress = get(lineProgressAtom) as HTMLProgressElement;
        if (lineProgress) {
          lineProgress.value = value;
        }
      });
    }, []),
    { store },
  );

  const setTotalProgressValue = useAtomCallback(
    useCallback((get, _set, value: number) => {
      requestDebouncedAnimationFrame("total-progress", () => {
        const totalProgress = get(totalProgressAtom) as HTMLProgressElement;
        if (totalProgress) {
          totalProgress.value = value;
        }
      });
    }, []),
    { store },
  );

  return {
    readTotalProgress,
    readLineProgress,
    writeLineProgress,
    writeTotalProgress,
    setLineProgressValue,
    setTotalProgressValue,
  };
};

const lineResultCardsAtom = atom<HTMLDivElement[]>([]);

export const useResultCards = () => {
  const readResultCards = useAtomCallback(
    useCallback((get) => get(lineResultCardsAtom), []),
    { store },
  );

  const writeResultCards = useAtomCallback(
    useCallback((_get, set, newCards: HTMLDivElement[]) => {
      set(lineResultCardsAtom, newCards);
    }, []),
    { store },
  );

  return { readResultCards, writeResultCards };
};
