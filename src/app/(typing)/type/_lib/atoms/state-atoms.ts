import deepEqual from "fast-deep-equal";
import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily, atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import type { BuildMap } from "@/lib/build-map/build-map";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";
import type { ResultData } from "@/server/drizzle/validator/result";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import type { InputMode, LineData, LineWord, SceneType, SkipGuideKey } from "../type";
import { lineProgressAtom, readUtilityRefParams, utilityRefParamsAtom } from "./read-atoms";
import { speedBaseAtom } from "./speed-reducer-atoms";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const initialInputMode: InputMode =
  typeof window !== "undefined" ? (localStorage.getItem("inputMode") as InputMode) || "roma" : "roma";

export const userTypingOptionsAtom = atomWithReset(DEFAULT_TYPING_OPTIONS);

const writeTypingOptionsAtom = atom(
  null,
  (_get, set, newUserTypingOptions: Partial<ExtractAtomValue<typeof userTypingOptionsAtom>>) => {
    set(userTypingOptionsAtom, (prev) => ({ ...prev, ...newUserTypingOptions }));
    set(utilityRefParamsAtom, (prev) => ({ ...prev, isOptionEdited: true }));
  },
);

export const useUserTypingOptionsState = () => useAtomValue(userTypingOptionsAtom, { store });
export const useSetUserTypingOptions = () => {
  const setUserTypingOptions = useSetAtom(writeTypingOptionsAtom, { store });
  const resetUserTypingOptions = useAtomCallback(
    useCallback((_get, set) => {
      set(userTypingOptionsAtom, RESET);
      set(utilityRefParamsAtom, (prev) => ({ ...prev, isOptionEdited: true }));
    }, []),
    { store },
  );

  return { setUserTypingOptions, resetUserTypingOptions };
};
export const useReadUserTypingOptions = () => {
  return useAtomCallback(
    useCallback((get) => get(userTypingOptionsAtom), []),
    { store },
  );
};

const mapAtom = atomWithReset<BuildMap | null>(null);
export const useMapState = () => useAtomValue(mapAtom, { store });
export const useSetMap = () => useSetAtom(mapAtom, { store });
export const useReadMap = () => {
  return useAtomCallback(
    useCallback((get) => get(mapAtom), []),
    { store },
  );
};

export const TAB_NAMES = ["ステータス", "ランキング"] as const;
const gameUtilityParamsAtom = atomWithReset({
  scene: "ready" as SceneType,
  tabName: "ランキング" as (typeof TAB_NAMES)[number],
  inputMode: initialInputMode,
  notify: Symbol(""),
  activeSkipKey: null as SkipGuideKey,
  changeCSSCount: 0,
  lineSelectIndex: 0,
  isYTStarted: false,
  lineResultdrawerClosure: false,
  isPaused: false,
  movieDuration: 0,
});

const lineResultDrawerClosureAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("lineResultdrawerClosure"));

export const useLineResultDrawerState = () => useAtomValue(lineResultDrawerClosureAtom);
export const useSetLineResultDrawer = () => useSetAtom(lineResultDrawerClosureAtom);

export const sceneAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("scene"));
const sceneGroupAtom = atom((get) => {
  const scene = get(sceneAtom);
  switch (scene) {
    case "ready": {
      return "Ready";
    }
    case "play":
    case "practice":
    case "replay": {
      return "Playing";
    }
    case "play_end":
    case "practice_end":
    case "replay_end": {
      return "End";
    }
  }
});
const tabNameAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("tabName"));
const notifyAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("notify"));
const activeSkipKeyAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("activeSkipKey"));
const changeCSSCountAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("changeCSSCount"));
const lineSelectIndexAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("lineSelectIndex"));
const playingInputModeAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("inputMode"));
const isYTStartedAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("isYTStarted"));
const isPausedAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("isPaused"));
const movieDurationAtom = focusAtom(gameUtilityParamsAtom, (optic) => optic.prop("movieDuration"));

const writeChangeCSSCountAtom = atom(null, (get, set, { newCurrentCount }: { newCurrentCount: number }) => {
  const map = get(mapAtom);
  if (!map) return;

  if (map.mapChangeCSSCounts.length > 0) {
    const closestMin = map.mapChangeCSSCounts
      .filter((count) => count <= newCurrentCount)
      .reduce((prev, curr) => (prev === undefined || curr > prev ? curr : prev), 0);

    set(changeCSSCountAtom, closestMin);
  }
});

export const useReadGameUtilityParams = () => {
  return useAtomCallback(
    useCallback((get) => get(gameUtilityParamsAtom), []),
    { store },
  );
};

export const useResetGameUtilityParams = () => {
  return useAtomCallback(
    useCallback((_, set) => set(gameUtilityParamsAtom, RESET), []),
    { store },
  );
};

export const useTabNameState = () => useAtomValue(tabNameAtom);
export const useSetTabName = () => useSetAtom(tabNameAtom);

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSceneGroupState = () => useAtomValue(sceneGroupAtom, { store });
export const useSetScene = () => useSetAtom(sceneAtom, { store });

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const useSetPlayingInputMode = () => useSetAtom(playingInputModeAtom, { store });

export const useActiveSkipGuideKeyState = () => useAtomValue(activeSkipKeyAtom, { store });
export const useSetActiveSkipGuideKey = () => useSetAtom(activeSkipKeyAtom, { store });

export const useNotifyState = () => useAtomValue(notifyAtom, { store });
export const useSetNotify = () => useSetAtom(notifyAtom, { store });

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store });
export const useSetChangeCSSCount = () => useSetAtom(writeChangeCSSCountAtom, { store });

export const useIsPaused = () => useAtomValue(isPausedAtom, { store });
export const useSetIsPaused = () => useSetAtom(isPausedAtom, { store });

export const useMovieDurationState = () => useAtomValue(movieDurationAtom, { store });
export const useSetMovieDuration = () => useSetAtom(movieDurationAtom, { store });

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom, { store });

export const useSetLineSelectIndex = () => {
  return useAtomCallback(
    useCallback((get, set, lineIndex: number) => {
      const map = get(mapAtom);
      if (!map) return;

      const count = map.typingLineIndexes[lineIndex - 1];
      if (count === undefined) return;

      const prevSelectedIndex = get(lineSelectIndexAtom);
      if (prevSelectedIndex !== null && prevSelectedIndex !== lineIndex) {
        const prevCount = map.typingLineIndexes[prevSelectedIndex - 1];
        if (prevCount !== undefined) {
          const prevSelectedAtom = lineResultAtomFamily(prevCount);
          const prev = get(prevSelectedAtom);
          if (prev) {
            set(prevSelectedAtom, { ...prev, isSelected: false });
          }
        }
      }

      const targetAtom = lineResultAtomFamily(count);
      const target = get(targetAtom);
      if (!target) return;

      set(lineSelectIndexAtom, lineIndex);
      set(targetAtom, { ...target, isSelected: true });
    }, []),
    { store },
  );
};

export const useYTStartedState = () => useAtomValue(isYTStartedAtom);
export const useSetYTStarted = () => useSetAtom(isYTStartedAtom);

const substatusAtom = atomWithReset({
  elapsedSecTime: 0,
  lineRemainTime: 0,
  lineKpm: 0,
  combo: 0,
});

export const useResetSubstatus = () => {
  return useAtomCallback(
    useCallback((_, set) => set(substatusAtom, RESET), []),
    { store },
  );
};

const elapsedSecTimeAtom = focusAtom(substatusAtom, (optic) => optic.prop("elapsedSecTime"));
const lineRemainTimeAtom = focusAtom(substatusAtom, (optic) => optic.prop("lineRemainTime"));
const lineKpmAtom = focusAtom(substatusAtom, (optic) => optic.prop("lineKpm"));
const comboAtom = focusAtom(substatusAtom, (optic) => optic.prop("combo"));

export const useLineRemainTimeState = () => useAtomValue(lineRemainTimeAtom, { store });
export const useSetLineRemainTime = () => useSetAtom(lineRemainTimeAtom, { store });
export const useLineKpmState = () => useAtomValue(lineKpmAtom, { store });
export const useSetLineKpm = () => useSetAtom(lineKpmAtom, { store });
export const useReadLineKpm = () => {
  return useAtomCallback(
    useCallback((get) => get(lineKpmAtom), []),
    { store },
  );
};

export const useComboState = () => useAtomValue(comboAtom, { store });
export const useSetCombo = () => useSetAtom(comboAtom, { store });
export const useReadCombo = () => {
  return useAtomCallback(
    useCallback((get) => get(comboAtom), []),
    { store },
  );
};

export const useElapsedSecTimeState = () => useAtomValue(elapsedSecTimeAtom, { store });
export const useSetElapsedSecTime = () => useSetAtom(elapsedSecTimeAtom, { store });
export const useReadElapsedSecTime = () => {
  return useAtomCallback(
    useCallback((get) => get(elapsedSecTimeAtom), []),
    { store },
  );
};

const lineResultAtomFamily = atomFamily(
  () => atom<{ isSelected: boolean; lineResult: ResultData[number] } | undefined>(),
  deepEqual,
);

export const useLineResultState = (index: number) => useAtomValue(lineResultAtomFamily(index), { store });

export const useSetLineResult = () => {
  return useAtomCallback(
    useCallback((get, set, { index, lineResult }: { index: number; lineResult: ResultData[number] }) => {
      const prev = get(lineResultAtomFamily(index));
      if (!prev) return;
      set(lineResultAtomFamily(index), { ...prev, lineResult });
    }, []),
    { store },
  );
};

export const useReadAllLineResult = () => {
  return useAtomCallback(
    useCallback((get): ResultData => {
      const results: ResultData = [];
      let index = 0;

      while (true) {
        const atom = lineResultAtomFamily(index);
        const result = get(atom);

        if (result !== undefined) {
          results.push(result.lineResult);
          index++;
        } else {
          break;
        }
      }

      return results;
    }, []),
    { store },
  );
};

export const useInitializeLineResults = () => {
  return useAtomCallback(
    useCallback((_get, set, lineResults: ResultData) => {
      lineResults.forEach((lineResult, index) => {
        set(lineResultAtomFamily(index), { isSelected: false, lineResult });
      });
    }, []),
    { store },
  );
};

export const useClearLineResults = () => {
  return useAtomCallback(
    useCallback((get) => {
      let index = 0;
      while (true) {
        try {
          const atom = lineResultAtomFamily(index);
          const result = get(atom);
          if (result !== undefined) {
            lineResultAtomFamily.remove(index);
            index++;
          } else {
            break;
          }
        } catch {
          break;
        }
      }
    }, []),
    { store },
  );
};

const nextLyricsAtom = atomWithReset({
  lyrics: "",
  kpm: "",
  kanaWord: "",
  romaWord: "",
});

const writeNextLyricsAtom = atom(null, (get, set, line: LineData) => {
  const typingOptions = get(userTypingOptionsAtom);
  const inputMode = get(playingInputModeAtom);
  const speed = get(speedBaseAtom);

  const nextKpm = (inputMode === "roma" ? line.kpm.r : line.kpm.k) * speed.playSpeed;

  set(nextLyricsAtom, () => {
    if (line.kanaWord) {
      return {
        lyrics: typingOptions.nextDisplay === "WORD" ? line.kanaWord : line.lyrics,
        kpm: nextKpm.toFixed(0),
        kanaWord: line.kanaWord.slice(0, 60),
        romaWord: line.word
          .map((w) => w.r[0])
          .join("")
          .slice(0, 60),
      };
    }

    return RESET;
  });
});

export const useNextLyricsState = () => useAtomValue(nextLyricsAtom, { store });
export const useSetNextLyrics = () => {
  const setNextLyrics = useSetAtom(writeNextLyricsAtom, { store });
  const resetNextLyrics = useCallback(() => store.set(nextLyricsAtom, RESET), []);

  return { setNextLyrics, resetNextLyrics };
};

const currentLineAtom = atomWithReset<{ lineWord: LineWord; lyrics: string }>({
  lineWord: {
    correct: { k: "", r: "" },
    nextChar: { k: "", r: [""], p: 0, t: undefined },
    word: [{ k: "", r: [""], p: 0, t: undefined }],
  },
  lyrics: "",
});

const lineWordAtom = focusAtom(currentLineAtom, (optic) => optic.prop("lineWord"));
const lineLyricsAtom = focusAtom(currentLineAtom, (optic) => optic.prop("lyrics"));

export const useLineWordState = () => useAtomValue(lineWordAtom, { store });
export const useSetLineWord = () => useSetAtom(lineWordAtom, { store });
export const useReadLineWord = () => {
  return useAtomCallback(
    useCallback((get) => get(lineWordAtom), []),
    { store },
  );
};

export const useLyricsState = () => useAtomValue(lineLyricsAtom, { store });

const writeCurrentLineAtom = atom(
  null,
  (get, set, { newCurrentLine, newNextLine }: { newCurrentLine: LineData; newNextLine: LineData }) => {
    const cloneWord = structuredClone([...newCurrentLine.word]);
    const nextChar = cloneWord[0];
    if (!nextChar) return;

    set(currentLineAtom, {
      lineWord: {
        correct: { k: "", r: "" },
        nextChar,
        word: cloneWord.slice(1),
      },
      lyrics: newCurrentLine.lyrics,
    });

    const lineProgress = get(lineProgressAtom);
    const { isPaused } = get(gameUtilityParamsAtom);

    if (lineProgress && !isPaused) {
      requestDebouncedAnimationFrame("line-progress-reset", () => {
        if (lineProgress) {
          lineProgress.value = 0;
          lineProgress.max = newNextLine.time - newCurrentLine.time;
        }
      });
    }
  },
);

export const useSetCurrentLine = () => {
  const setCurrentLine = useSetAtom(writeCurrentLineAtom, { store });
  const resetCurrentLine = useCallback(() => {
    store.set(currentLineAtom, RESET);
    const map = store.get(mapAtom);
    const lineProgress = store.get(lineProgressAtom);

    if (lineProgress && map && map.mapData[1]) {
      lineProgress.value = 0;
      lineProgress.max = map.mapData[1].time;
    }
  }, []);

  return { setCurrentLine, resetCurrentLine };
};

const typingStatusAtom = atomWithReset({
  score: 0,
  type: 0,
  kpm: 0,
  rank: 0,
  point: 0,
  miss: 0,
  lost: 0,
  line: 0,
  timeBonus: 0,
});
export const focusTypingStatusAtoms = {
  score: focusAtom(typingStatusAtom, (optic) => optic.prop("score")),
  type: focusAtom(typingStatusAtom, (optic) => optic.prop("type")),
  kpm: focusAtom(typingStatusAtom, (optic) => optic.prop("kpm")),
  rank: focusAtom(typingStatusAtom, (optic) => optic.prop("rank")),
  point: focusAtom(typingStatusAtom, (optic) => optic.prop("point")),
  miss: focusAtom(typingStatusAtom, (optic) => optic.prop("miss")),
  lost: focusAtom(typingStatusAtom, (optic) => optic.prop("lost")),
  line: focusAtom(typingStatusAtom, (optic) => optic.prop("line")),
  timeBonus: focusAtom(typingStatusAtom, (optic) => optic.prop("timeBonus")),
};

export const useSetTypingStatusLine = () => useSetAtom(focusTypingStatusAtoms.line, { store });
export const useSetTypingStatusRank = () => useSetAtom(focusTypingStatusAtoms.rank, { store });
export const useTypingStatusState = () => useAtomValue(typingStatusAtom, { store });
export const useSetTypingStatus = () => {
  const readMap = useReadMap();
  const setTypingStatus = useSetAtom(typingStatusAtom, { store });
  const setLineCount = useSetTypingStatusLine();
  const setRank = useSetTypingStatusRank();

  const resetTypingStatus = () => {
    setTypingStatus(RESET);
    setLineCount(readMap()?.lineLength || 0);

    const { rankingScores } = readUtilityRefParams();
    setRank(rankingScores.length + 1);
  };

  return { setTypingStatus, resetTypingStatus };
};
export const useReadTypingStatus = () => {
  return useAtomCallback(
    useCallback((get) => get(typingStatusAtom), []),
    { store },
  );
};
