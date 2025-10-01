import deepEqual from "fast-deep-equal";
import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily, atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";
import type { ResultData } from "@/server/drizzle/validator/result";
import type { BuildMap } from "@/utils/build-map/build-map";
import type { InputMode, LineData, LineWord, SceneType } from "../type";
import {
  gameUtilityReferenceParamsAtom,
  lineProgressAtom,
  useGameUtilityReferenceParams,
  ytStatusAtom,
} from "./read-atoms";
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
    set(gameUtilityReferenceParamsAtom, (prev) => ({ ...prev, isOptionEdited: true }));
  },
);

export const useUserTypingOptionsState = () => useAtomValue(userTypingOptionsAtom, { store });
export const useSetUserTypingOptions = () => {
  const setUserTypingOptions = useSetAtom(writeTypingOptionsAtom, { store });
  const resetUserTypingOptions = useAtomCallback(
    useCallback((_get, set) => {
      set(userTypingOptionsAtom, RESET);
      set(gameUtilityReferenceParamsAtom, (prev) => ({ ...prev, isOptionEdited: true }));
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
const gameStateUtilParamsAtom = atomWithReset({
  scene: "ready" as SceneType,
  tabName: "ランキング" as (typeof TAB_NAMES)[number],
  inputMode: initialInputMode,
  notify: Symbol(""),
  skip: "" as "Space" | "",
  changeCSSCount: 0,
  lineSelectIndex: 0,
  isYTStarted: false,
  lineResultdrawerClosure: false,
});

const lineResultDrawerClosure = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("lineResultdrawerClosure"));

export const useLineResultDrawerState = () => useAtomValue(lineResultDrawerClosure);
export const useSetLineResultDrawer = () => useSetAtom(lineResultDrawerClosure);

export const sceneAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("scene"));
export const sceneGroupAtom = atom((get) => {
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
const tabNameAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("tabName"));
export const notifyAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("notify"));
const skipAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("skip"));
const changeCSSCountAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("changeCSSCount"));
const lineSelectIndexAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("lineSelectIndex"));
const playingInputModeAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("inputMode"));
const isYTStartedAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("isYTStarted"));

const writeSceneAtom = atom(null, (_get, set, newScene: SceneType) => {
  set(sceneAtom, newScene);
});

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

export const useReadGameUtilParams = () => {
  return useAtomCallback(
    useCallback((get) => get(gameStateUtilParamsAtom), []),
    { store },
  );
};

export const useSetGameUtilParams = () => useSetAtom(gameStateUtilParamsAtom, { store });

export const useTabNameState = () => useAtomValue(tabNameAtom);
export const useSetTabName = () => useSetAtom(tabNameAtom);

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSceneGroupState = () => useAtomValue(sceneGroupAtom, { store });
export const useSetScene = () => useSetAtom(writeSceneAtom, { store });

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const useSetPlayingInputMode = () => useSetAtom(playingInputModeAtom, { store });

export const useSkipState = () => useAtomValue(skipAtom, { store });
export const useSetSkip = () => useSetAtom(skipAtom, { store });

export const useNotifyState = () => useAtomValue(notifyAtom);
export const useSetNotify = () => useSetAtom(notifyAtom);

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store });
export const useSetChangeCSSCount = () => useSetAtom(writeChangeCSSCountAtom, { store });

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom);

export const useSetLineSelectIndex = () => {
  return useAtomCallback(
    useCallback((get, set, index: number) => {
      const prevSelectedIndex = get(lineSelectIndexAtom);
      if (prevSelectedIndex !== null) {
        const prevAtom = lineResultAtomFamily(prevSelectedIndex);
        const prevResult = get(prevAtom);
        if (prevResult) {
          set(prevAtom, {
            ...prevResult,
            isSelected: false,
          });
        }
      }

      // 指定されたインデックスの行が存在するかチェック
      const targetAtom = lineResultAtomFamily(index);
      const targetResult = get(targetAtom);

      if (!targetResult) {
        return; // 存在しない行は選択できない
      }

      // 新しい行を選択
      set(lineSelectIndexAtom, index);
      set(targetAtom, {
        ...targetResult,
        isSelected: true,
      });
    }, []), // 依存関係配列を追加
    { store },
  );
};

export const useYTStartedState = () => useAtomValue(isYTStartedAtom);
export const useSetYTStarted = () => useSetAtom(isYTStartedAtom);

const playingStateAtom = atomWithReset({
  currentTime: 0,
  lineRemainTime: 0,
  lineKpm: 0,
  combo: 0,
});

export const useResetPlayingState = () => {
  const setPlayingState = useSetAtom(playingStateAtom);

  return () => {
    setPlayingState(RESET);
  };
};

const currentTimeAtom = focusAtom(playingStateAtom, (optic) => optic.prop("currentTime"));
const lineRemainTimeAtom = focusAtom(playingStateAtom, (optic) => optic.prop("lineRemainTime"));
const lineKpmAtom = focusAtom(playingStateAtom, (optic) => optic.prop("lineKpm"));
const comboAtom = focusAtom(playingStateAtom, (optic) => optic.prop("combo"));

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

export const useCurrentTimeState = () => useAtomValue(currentTimeAtom, { store });
export const useSetCurrentTime = () => useSetAtom(currentTimeAtom, { store });
export const useReadCurrentTime = () => {
  return useAtomCallback(
    useCallback((get) => get(currentTimeAtom), []),
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
      set(lineResultAtomFamily(index), {
        ...prev,
        lineResult,
      });
    }, []),
    { store },
  );
};

export const useReadLineResult = (index: number) => {
  return useAtomCallback(
    useCallback((get) => get(lineResultAtomFamily(index)), [index]),
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

    set(currentLineAtom, {
      lineWord: {
        correct: { k: "", r: "" },
        nextChar: cloneWord[0],
        word: cloneWord.slice(1),
      },
      lyrics: newCurrentLine.lyrics,
    });

    const lineProgress = get(lineProgressAtom);
    const { isPaused } = get(ytStatusAtom);

    if (lineProgress && !isPaused) {
      lineProgress.value = 0;
      lineProgress.max = newNextLine.time - newCurrentLine.time;
    }
  },
);

export const useSetCurrentLine = () => {
  const setCurrentLine = useSetAtom(writeCurrentLineAtom, { store });
  const resetCurrentLine = useCallback(() => {
    store.set(currentLineAtom, RESET);
    const map = store.get(mapAtom);
    const lineProgress = store.get(lineProgressAtom);

    if (lineProgress && map) {
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
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const setTypingStatus = useSetAtom(typingStatusAtom, { store });
  const setLineCount = useSetTypingStatusLine();
  const setRank = useSetTypingStatusRank();

  const resetTypingStatus = () => {
    setTypingStatus(RESET);
    setLineCount(readMap()?.lineLength || 0);

    const { rankingScores } = readGameUtilRefParams();
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
