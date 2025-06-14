import { YTPlayer } from "@/types/global-types";
import { atom, ExtractAtomValue } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputMode, TypeResult } from "../ts/type";
import { getTypeAtomStore } from "./store";
const store = getTypeAtomStore();

const lineCountAtom = atomWithReset(0);

export const useLineCount = () => {
  const readCount = useAtomCallback(
    useCallback((get) => get(lineCountAtom), []),
    { store },
  );
  const writeCount = useAtomCallback(
    useCallback((get, set, newCount: number) => {
      set(lineCountAtom, newCount);
    }, []),
    { store },
  );

  return { readCount, writeCount };
};

const typingDetailsAtom = atomWithReset({
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

export const useTypingDetails = () => {
  const readStatus = useAtomCallback(
    useCallback((get) => get(typingDetailsAtom), []),
    { store },
  );
  const writeStatus = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof typingDetailsAtom>>) => {
      set(typingDetailsAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store },
  );

  const resetStatus = useAtomCallback(
    useCallback((get, set) => {
      set(typingDetailsAtom, RESET);
    }, []),
    { store },
  );

  return { readStatus, writeStatus, resetStatus };
};

export const lineStatusAtom = atomWithReset({
  type: 0,
  miss: 0,
  latency: 0,
  typeResult: [] as TypeResult[],
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
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof lineStatusAtom>>) => {
      set(lineStatusAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store },
  );
  const resetLineStatus = useAtomCallback(
    useCallback((get, set) => {
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
  totalTypeTime: 0,
  maxCombo: 0,
});

export const useUserStats = () => {
  const readUserStats = useAtomCallback(
    useCallback((get) => get(userStatsAtom), []),
    { store },
  );

  const writeUserStats = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof userStatsAtom>>) => {
      set(userStatsAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store },
  );
  const resetUserStats = useAtomCallback(
    useCallback((get, set, maxCombo = 0) => {
      set(userStatsAtom, RESET);
      set(userStatsAtom, (prev) => ({ ...prev, maxCombo }));
    }, []),
    { store },
  );

  return { readUserStats, writeUserStats, resetUserStats };
};

export const ytStatusAtom = atomWithReset({
  isPaused: false,
  movieDuration: 0,
});

export const useYTStatus = () => {
  const readYTStatus = useAtomCallback(
    useCallback((get) => get(ytStatusAtom), []),
    { store },
  );
  const writeYTStatus = useAtomCallback(
    useCallback((get, set, newYTStatus: Partial<ExtractAtomValue<typeof ytStatusAtom>>) => {
      set(ytStatusAtom, (prev) => {
        return { ...prev, ...newYTStatus };
      });
    }, []),
    { store },
  );
  const resetYTStatus = useAtomCallback(
    useCallback((get, set) => {
      set(ytStatusAtom, RESET);
    }, []),
    { store },
  );

  return {
    readYTStatus,
    writeYTStatus,
    resetYTStatus,
  };
};

export const gameUtilityReferenceParamsAtom = atomWithReset({
  isRetrySkip: false,
  retryCount: 1,
  timeOffset: 0,
  startPlaySpeed: 1,
  updateMsTimeCount: 0,
  myBestScore: 0,
  replayKeyCount: 0,
  replayUserName: "",
  rankingScores: [] as number[],
  practiceMyResultId: null as number | null,
  isOptionEdited: false,
  lineResultdrawerClosure: null as { isOpen: boolean; onOpen: () => void; onClose: () => void; } | null,
});

export const useGameUtilityReferenceParams = () => {
  const readGameUtilRefParams = useAtomCallback(
    useCallback((get) => get(gameUtilityReferenceParamsAtom), []),
    { store },
  );
  const writeGameUtilRefParams = useAtomCallback(
    useCallback((get, set, newGameState: Partial<ExtractAtomValue<typeof gameUtilityReferenceParamsAtom>>) => {
      set(gameUtilityReferenceParamsAtom, (prev) => {
        return { ...prev, ...newGameState };
      });
    }, []),
    { store },
  );
  const resetGameUtilRefParams = useAtomCallback(
    useCallback((get, set) => {
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

export const playerAtom = atom<YTPlayer | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerAtom) as YTPlayer, []),
    { store },
  );

  const writePlayer = useAtomCallback(
    useCallback((get, set, newPlayer: YTPlayer | null) => {
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
    useCallback((get, set, newProgress: HTMLProgressElement | null) => {
      set(lineProgressAtom, newProgress);
    }, []),
    { store },
  );

  const writeTotalProgress = useAtomCallback(
    useCallback((get, set, newProgress: HTMLProgressElement | null) => {
      set(totalProgressAtom, newProgress);
    }, []),
    { store },
  );

  const setLineProgressValue = useAtomCallback(
    useCallback((get, set, value: number) => {
      const lineProgress = get(lineProgressAtom) as HTMLProgressElement;
      lineProgress.value = value;
    }, []),
    { store },
  );

  const setTotalProgressValue = useAtomCallback(
    useCallback((get, set, value: number) => {
      const totalProgress = get(totalProgressAtom) as HTMLProgressElement;
      totalProgress.value = value;
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
    useCallback((get) => get(lineResultCardsAtom) as HTMLDivElement[], []),
    { store },
  );

  const writeResultCards = useAtomCallback(
    useCallback((get, set, newCards: HTMLDivElement[]) => {
      set(lineResultCardsAtom, newCards);
    }, []),
    { store },
  );

  return { readResultCards, writeResultCards };
};
