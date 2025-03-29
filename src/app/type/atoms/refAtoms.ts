import { YTPlayer } from "@/types/global-types";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { atom, ExtractAtomValue } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputMode, PlayMode, TypeResult } from "../ts/type";
import { getTypeAtomStore } from "./store";
const store = getTypeAtomStore();

export const countRefAtom = atomWithReset(0);

export const useCountRef = () => {
  const readCount = useAtomCallback(
    useCallback((get) => get(countRefAtom), []),
    { store }
  );
  const writeCount = useAtomCallback(
    useCallback((get, set, newCount: number) => {
      set(countRefAtom, newCount);
    }, []),
    { store }
  );

  return { readCount, writeCount };
};

const statusRefAtom = atomWithReset({
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

export const useStatusRef = () => {
  const readStatus = useAtomCallback(
    useCallback((get) => get(statusRefAtom), []),
    { store }
  );
  const writeStatus = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof statusRefAtom>>) => {
      set(statusRefAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store }
  );
  const resetStatus = useAtomCallback(
    useCallback((get, set) => {
      set(statusRefAtom, RESET);
    }, []),
    { store }
  );

  return { readStatus, writeStatus, resetStatus };
};

export const lineStatusRefAtom = atomWithReset({
  type: 0,
  miss: 0,
  latency: 0,
  typeResult: [] as TypeResult[],
  startSpeed: 1,
  startInputMode: "roma" as InputMode,
  isCompleted: false,
  rkpm: 0,
});

export const useLineStatusRef = () => {
  const readLineStatus = useAtomCallback(
    useCallback((get) => get(lineStatusRefAtom), []),
    { store }
  );
  const writeLineStatus = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof lineStatusRefAtom>>) => {
      set(lineStatusRefAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store }
  );
  const resetLineStatus = useAtomCallback(
    useCallback((get, set) => {
      set(lineStatusRefAtom, RESET);
    }, []),
    { store }
  );

  return { readLineStatus, writeLineStatus, resetLineStatus };
};

const userStatsRefAtom = atomWithReset({
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

export const useUserStatsRef = () => {
  const readUserStats = useAtomCallback(
    useCallback((get) => get(userStatsRefAtom), []),
    { store }
  );

  const writeUserStats = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof userStatsRefAtom>>) => {
      set(userStatsRefAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, []),
    { store }
  );
  const resetUserStats = useAtomCallback(
    useCallback((get, set, maxCombo = 0) => {
      set(userStatsRefAtom, RESET);
      set(userStatsRefAtom, (prev) => ({ ...prev, maxCombo }));
    }, []),
    { store }
  );

  return { readUserStats, writeUserStats, resetUserStats };
};

export const ytStatusRefAtom = atomWithReset({
  isPaused: false,
  movieDuration: 0,
});

export const useYTStatusRef = () => {
  const readYTStatus = useAtomCallback(
    useCallback((get) => get(ytStatusRefAtom), []),
    { store }
  );
  const writeYTStatus = useAtomCallback(
    useCallback((get, set, newYTStatus: Partial<ExtractAtomValue<typeof ytStatusRefAtom>>) => {
      set(ytStatusRefAtom, (prev) => {
        return { ...prev, ...newYTStatus };
      });
    }, []),
    { store }
  );
  const resetYTStatus = useAtomCallback(
    useCallback((get, set) => {
      set(ytStatusRefAtom, RESET);
    }, []),
    { store }
  );

  return {
    readYTStatus,
    writeYTStatus,
    resetYTStatus,
  };
};

export const gameUtilsRefAtom = atomWithReset({
  isRetrySkip: false,
  retryCount: 1,
  timeOffset: 0,
  playMode: "playing" as PlayMode,
  startPlaySpeed: 1,
  updateMsTimeCount: 0,
  myBestScore: 0,
  replayKeyCount: 0,
  replayUserName: "",
  rankingScores: [] as number[],
  practiceMyResultId: null as number | null,
  isOptionEdited: false,
  lineResultdrawerClosure: null as UseDisclosureReturn | null,
});

export const useGameUtilsRef = () => {
  const readGameUtils = useAtomCallback(
    useCallback((get) => get(gameUtilsRefAtom), []),
    { store }
  );
  const writeGameUtils = useAtomCallback(
    useCallback((get, set, newGameState: Partial<ExtractAtomValue<typeof gameUtilsRefAtom>>) => {
      set(gameUtilsRefAtom, (prev) => {
        return { ...prev, ...newGameState };
      });
    }, []),
    { store }
  );
  const resetGameUtils = useAtomCallback(
    useCallback((get, set) => {
      set(gameUtilsRefAtom, RESET);
    }, []),
    { store }
  );

  return {
    readGameUtils,
    writeGameUtils,
    resetGameUtils,
  };
};

export const playerRefAtom = atom<YTPlayer | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(
    useCallback((get) => get(playerRefAtom) as YTPlayer, []),
    { store }
  );

  const writePlayer = useAtomCallback(
    useCallback((get, set, newPlayer: YTPlayer | null) => {
      set(playerRefAtom, newPlayer);
    }, []),
    { store }
  );

  return { readPlayer, writePlayer };
};

export const lineProgressRefAtom = atom<HTMLProgressElement | null>(null);
const totalProgressRefAtom = atom<HTMLProgressElement | null>(null);

export const useProgress = () => {
  const readLineProgress = useAtomCallback(
    useCallback((get) => get(lineProgressRefAtom) as HTMLProgressElement, []),
    { store }
  );
  const readTotalProgress = useAtomCallback(
    useCallback((get) => get(totalProgressRefAtom) as HTMLProgressElement, []),
    { store }
  );

  const writeLineProgress = useAtomCallback(
    useCallback((get, set, newProgress: HTMLProgressElement | null) => {
      set(lineProgressRefAtom, newProgress);
    }, []),
    { store }
  );

  const writeTotalProgress = useAtomCallback(
    useCallback((get, set, newProgress: HTMLProgressElement | null) => {
      set(totalProgressRefAtom, newProgress);
    }, []),
    { store }
  );

  const setLineProgressValue = useAtomCallback(
    useCallback((get, set, value: number) => {
      const lineProgress = get(lineProgressRefAtom) as HTMLProgressElement;
      lineProgress.value = value;
    }, []),
    { store }
  );

  const setTotalProgressValue = useAtomCallback(
    useCallback((get, set, value: number) => {
      const totalProgress = get(totalProgressRefAtom) as HTMLProgressElement;
      totalProgress.value = value;
    }, []),
    { store }
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

const lineResultCardRefsAtom = atom<HTMLDivElement[]>([]);

export const useResultCards = () => {
  const readResultCards = useAtomCallback(
    useCallback((get) => get(lineResultCardRefsAtom) as HTMLDivElement[], []),
    { store }
  );

  const writeResultCards = useAtomCallback(
    useCallback((get, set, newCards: HTMLDivElement[]) => {
      set(lineResultCardRefsAtom, newCards);
    }, []),
    { store }
  );

  return { readResultCards, writeResultCards };
};
