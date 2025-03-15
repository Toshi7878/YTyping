import { YTPlayer } from "@/types/global-types";
import { atom, ExtractAtomValue } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputModeType, PlayMode, TypeResult } from "../ts/type";

const statusRefAtom = atomWithReset({
  count: 0,
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
  const readStatusRef = useAtomCallback(useCallback((get) => get(statusRefAtom), []));
  const writeStatusRef = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof statusRefAtom>>) => {
      set(statusRefAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, [])
  );
  const resetStatusRef = useAtomCallback(
    useCallback((get, set) => {
      set(statusRefAtom, RESET);
    }, [])
  );

  return { readStatusRef, writeStatusRef, resetStatusRef };
};

const lineStatusRefAtom = atomWithReset({
  type: 0,
  miss: 0,
  completedTime: 0,
  latency: 0,
  typeResult: [] as TypeResult[],
  startSpeed: 1,
  startInputMode: "roma" as InputModeType,
  isCompleted: false,
});

export const useLineStatusRef = () => {
  const readLineStatusRef = useAtomCallback(useCallback((get) => get(lineStatusRefAtom), []));
  const writeLineStatusRef = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof lineStatusRefAtom>>) => {
      set(lineStatusRefAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, [])
  );
  const resetLineStatusRef = useAtomCallback(
    useCallback((get, set) => {
      set(lineStatusRefAtom, RESET);
    }, [])
  );

  return { readLineStatusRef, writeLineStatusRef, resetLineStatusRef };
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
  const readUserStatsRef = useAtomCallback(useCallback((get) => get(userStatsRefAtom), []));
  const writeUserStatsRef = useAtomCallback(
    useCallback((get, set, newUserStats: Partial<ExtractAtomValue<typeof userStatsRefAtom>>) => {
      set(userStatsRefAtom, (prev) => {
        return { ...prev, ...newUserStats };
      });
    }, [])
  );
  const resetUserStatsRef = useAtomCallback(
    useCallback((get, set, maxCombo=0) => {
      set(userStatsRefAtom, RESET);
      set(userStatsRefAtom, (prev) => ({ ...prev, maxCombo }));
    }, [])
  );

  return { readUserStatsRef, writeUserStatsRef, resetUserStatsRef };
};

const ytStatusRefAtom = atomWithReset({
  isPaused: false,
  movieDuration: 0,
});

export const useYTStatusRef = () => {
  const readYTStatusRef = useAtomCallback(useCallback((get) => get(ytStatusRefAtom), []));
  const writeYTStatusRef = useAtomCallback(
    useCallback((get, set, newYTStatus: Partial<ExtractAtomValue<typeof ytStatusRefAtom>>) => {
      set(ytStatusRefAtom, (prev) => {
        return { ...prev, ...newYTStatus };
      });
    }, [])
  );
  const resetYTStatusRef = useAtomCallback(
    useCallback((get, set) => {
      set(ytStatusRefAtom, RESET);
    }, [])
  );

  return {
    readYTStatusRef,
    writeYTStatusRef,
    resetYTStatusRef,
  };
};

const gameRefAtom = atomWithReset({
  isRetrySkip: false,
  retryCount: 1,
  playMode: "playing" as PlayMode,
  startPlaySpeed: 1,
  updateMsTimeCount: 0,
  myBestScore: 0,
  replayKeyCount: 0,
  replayUserName: "",
  practiceMyResultId: null as number | null,
});

export const useGameRef = () => {
  const readGameRef = useAtomCallback(useCallback((get) => get(gameRefAtom), []));
  const writeGameRef = useAtomCallback(
    useCallback((get, set, newGameState: Partial<ExtractAtomValue<typeof gameRefAtom>>) => {
      set(gameRefAtom, (prev) => {
        return { ...prev, ...newGameState };
      });
    }, [])
  );
  const resetGameRef = useAtomCallback(
    useCallback((get, set) => {
      set(gameRefAtom, RESET);
    }, [])
  );

  return {
    readGameRef,
    writeGameRef,
    resetGameRef,
  };
};

export const playerRefAtom = atom<YTPlayer | null>(null);

export const usePlayer = () => {
  const readPlayer = useAtomCallback(useCallback((get) => get(playerRefAtom) as YTPlayer, []));

  const writePlayer = useAtomCallback(
    useCallback((get, set, newPlayer: YTPlayer | null) => {
      set(playerRefAtom, newPlayer);
    }, [])
  );

  return { readPlayer, writePlayer };
};

const lineProgressRefAtom = atom<HTMLProgressElement | null>(null);
const totalProgressRefAtom = atom<HTMLProgressElement | null>(null);

export const useProgress = () => {
  const readLineProgress = useAtomCallback(
    useCallback((get) => get(lineProgressRefAtom) as HTMLProgressElement, [])
  );
  const readTotalProgress = useAtomCallback(
    useCallback((get) => get(totalProgressRefAtom) as HTMLProgressElement, [])
  );

  const writeLineProgress = useAtomCallback(
    useCallback((get, set, newProgress: HTMLProgressElement | null) => {
      set(lineProgressRefAtom, newProgress);
    }, [])
  );

  const writeTotalProgress = useAtomCallback(
    useCallback((get, set, newProgress: HTMLProgressElement | null) => {
      set(totalProgressRefAtom, newProgress);
    }, [])
  );

  return { readTotalProgress, readLineProgress, writeLineProgress, writeTotalProgress };
};

const lineResultCardRefsAtom = atom<HTMLDivElement[]>([]);

export const useResultCards = () => {
  const readResultCards = useAtomCallback(
    useCallback((get) => get(lineResultCardRefsAtom) as HTMLDivElement[], [])
  );

  const writeResultCards = useAtomCallback(
    useCallback((get, set, newCards: HTMLDivElement[]) => {
      set(lineResultCardRefsAtom, newCards);
    }, [])
  );

  return { readResultCards, writeResultCards };
};
