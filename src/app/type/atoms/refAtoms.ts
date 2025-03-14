import { YTPlayer } from "@/types/global-types";
import { atom, useStore } from "jotai";
import { atomWithReset } from "jotai/utils";
import { InputModeType, PlayMode, TypeResult } from "../ts/type";

export const typingStatusRefAtom = atomWithReset({
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

export const lineTypingStatusRefAtom = atomWithReset({
  type: 0,
  miss: 0,
  completedTime: 0,
  latency: 0,
  typeResult: [] as TypeResult[],
  startSpeed: 1,
  startInputMode: "roma" as InputModeType,
  isCompleted: false,
});

export const userStatsRefAtom = atomWithReset({
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

export const ytStateRefAtom = atomWithReset({
  isPaused: false,
  movieDuration: 0,
});

export const gameStateRefAtom = atomWithReset({
  isRetrySkip: false,
  retryCount: 1,
  playMode: "playing" as PlayMode,
  startPlaySpeed: 1,
  displayLineTimeCount: 0,
  myBestScore: 0,
  replay: {
    replayKeyCount: 0,
    userName: "",
  },
  practice: {
    myResultId: null as number | null,
  },
});

export const playerRefAtom = atom<YTPlayer | null>(null);

export const usePlayer = () => {
  const typeAtomStore = useStore();

  const player = typeAtomStore.get(playerRefAtom) as YTPlayer;
  return player;
};

export const lineProgressRefAtom = atom<HTMLProgressElement | null>(null);
export const totalProgressRefAtom = atom<HTMLProgressElement | null>(null);
export const lineResultCardRefsAtom = atom<HTMLDivElement[]>([]);
