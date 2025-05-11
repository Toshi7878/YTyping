import { RouterOutPuts } from "@/server/api/trpc";
import { ParseMap } from "@/util/parse-map/parseMap";
import { $Enums } from "@prisma/client";
import { atom, ExtractAtomValue, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputMode, LineData, LineResultData, LineWord, SceneType } from "../ts/type";
import {
  gameUtilityReferenceParamsAtom,
  lineProgressAtom,
  useGameUtilityReferenceParams,
  ytStatusAtom,
} from "./refAtoms";
import { speedBaseAtom } from "./speedReducerAtoms";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const initialInputMode: InputMode =
  typeof window !== "undefined" ? (localStorage.getItem("inputMode") as InputMode) || "roma" : "roma";

export const userTypingOptionsAtom = atomWithReset({
  time_offset: 0,
  kana_word_scroll: 6,
  roma_word_scroll: 9,
  roma_word_font_size: 100,
  kana_word_font_size: 100,
  kana_word_top_position: 0,
  roma_word_top_position: 0,
  type_sound: false,
  miss_sound: false,
  line_clear_sound: false,
  next_display: "LYRICS" as $Enums.next_display,
  line_completed_display: "NEXT_WORD" as $Enums.line_completed_display,
  time_offset_key: "CTRL_LEFT_RIGHT" as $Enums.time_offset_key,
  toggle_input_mode_key: "ALT_KANA" as $Enums.toggle_input_mode_key,
});

const writeTypingOptionsAtom = atom(
  null,
  (get, set, newUserTypingOptions: Partial<ExtractAtomValue<typeof userTypingOptionsAtom>>) => {
    set(userTypingOptionsAtom, (prev) => ({ ...prev, ...newUserTypingOptions }));
    set(gameUtilityReferenceParamsAtom, (prev) => ({ ...prev, isOptionEdited: true }));
  }
);

export const useUserTypingOptionsState = () => useAtomValue(userTypingOptionsAtom, { store });
export const useSetUserTypingOptionsState = () => {
  const setUserTypingOptions = useSetAtom(writeTypingOptionsAtom, { store });
  const resetUserTypingOptions = useAtomCallback(
    useCallback((get, set) => {
      set(userTypingOptionsAtom, RESET);
      set(gameUtilityReferenceParamsAtom, (prev) => ({ ...prev, isOptionEdited: true }));
    }, []),
    { store }
  );

  return { setUserTypingOptions, resetUserTypingOptions };
};
export const useUserTypingOptionsStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(userTypingOptionsAtom), []),
    { store }
  );
};
export const mapInfoAtom = atom<RouterOutPuts["map"]["getMapInfo"]>();

export const useMapInfoRef = () => {
  const readMapInfo = useAtomCallback(
    useCallback((get) => get(mapInfoAtom) as NonNullable<RouterOutPuts["map"]["getMapInfo"]>, []),
    { store }
  );

  return { readMapInfo };
};

const mapLikeFocusAtom = focusAtom(mapInfoAtom, (optic) => optic.valueOr({} as { isLiked: undefined }).prop("isLiked"));
export const useIsLikeAtom = () => useAtomValue(mapLikeFocusAtom, { store });
export const useSetIsLikeAtom = () => useSetAtom(mapLikeFocusAtom, { store });

const mapAtom = atomWithReset<ParseMap | null>(null);
export const useMapState = () => useAtomValue(mapAtom, { store });
export const useSetMap = () => useSetAtom(mapAtom, { store });
export const useReadMapState = () => {
  return useAtomCallback(
    useCallback((get) => get(mapAtom) as ParseMap, []),
    { store }
  );
};

const gameStateUtilParamsAtom = atomWithReset({
  scene: "ready" as SceneType,
  tabIndex: 1 as 0 | 1,
  inputMode: initialInputMode,
  notify: Symbol(""),
  skip: "" as "Space" | "",
  changeCSSCount: 0,
  isLoadingOverlay: false,
  lineSelectIndex: 0,
  isYTStarted: false,
});

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
const tabIndexAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("tabIndex"));
export const notifyAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("notify"));
const skipAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("skip"));
const changeCSSCountAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("changeCSSCount"));
const lineSelectIndexAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("lineSelectIndex"));
const isLoadingOverlayAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("isLoadingOverlay"));
const playingInputModeAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("inputMode"));
const isYTStartedAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("isYTStarted"));

const writeSceneAtom = atom(null, (get, set, newScene: SceneType) => {
  set(sceneAtom, newScene);
});

const writeChangeCSSCountAtom = atom(null, (get, set, { newCurrentCount }: { newCurrentCount: number }) => {
  const map = get(mapAtom) as ParseMap;

  if (map.mapChangeCSSCounts.length) {
    const closestMin = map.mapChangeCSSCounts
      .filter((count) => count <= newCurrentCount)
      .reduce((prev, curr) => (prev === undefined || curr > prev ? curr : prev), 0);

    set(changeCSSCountAtom, closestMin);
  }
});

export const useReadGameUtilParams = () => {
  return useAtomCallback(
    useCallback((get) => get(gameStateUtilParamsAtom), []),
    { store }
  );
};

export const useSetGameUtilParams = () => useSetAtom(gameStateUtilParamsAtom, { store });

export const useTabIndexState = () => useAtomValue(tabIndexAtom);
export const useSetTabIndex = () => useSetAtom(tabIndexAtom);

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSceneGroupState = () => useAtomValue(sceneGroupAtom, { store });
export const useSetScene = () => useSetAtom(writeSceneAtom, { store });

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const useSetPlayingInputMode = () => useSetAtom(playingInputModeAtom, { store });

export const useIsLoadingOverlayState = () => useAtomValue(isLoadingOverlayAtom);
export const useSetIsLoadingOverlay = () => useSetAtom(isLoadingOverlayAtom);

export const useSkipState = () => useAtomValue(skipAtom, { store });
export const useSetSkip = () => useSetAtom(skipAtom, { store });

export const useNotifyState = () => useAtomValue(notifyAtom);
export const useSetNotify = () => useSetAtom(notifyAtom);

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store });
export const useSetChangeCSSCount = () => useSetAtom(writeChangeCSSCountAtom, { store });

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom);
export const useSetLineSelectIndex = () => useSetAtom(lineSelectIndexAtom);

export const useYTStartedState = () => useAtomValue(isYTStartedAtom);
export const useSetYTStarted = () => useSetAtom(isYTStartedAtom);

const playingStateAtom = atomWithReset({
  currentTime: 0,
  lineRemainTime: 0,
  lineKpm: 0,
  combo: 0,
});

const currentTimeAtom = focusAtom(playingStateAtom, (optic) => optic.prop("currentTime"));
const lineRemainTimeAtom = focusAtom(playingStateAtom, (optic) => optic.prop("lineRemainTime"));
const lineKpmAtom = focusAtom(playingStateAtom, (optic) => optic.prop("lineKpm"));
export const comboAtom = focusAtom(playingStateAtom, (optic) => optic.prop("combo"));

export const useLineRemainTimeState = () => useAtomValue(lineRemainTimeAtom, { store });
export const useSetLineRemainTime = () => useSetAtom(lineRemainTimeAtom, { store });

export const useLineKpmState = () => useAtomValue(lineKpmAtom, { store });
export const useSetLineKpm = () => useSetAtom(lineKpmAtom, { store });
export const useReadLineKpm = () => {
  return useAtomCallback(
    useCallback((get) => get(lineKpmAtom), []),
    { store }
  );
};

export const useComboState = () => useAtomValue(comboAtom, { store });
export const useSetCombo = () => useSetAtom(comboAtom, { store });
export const useReadCombo = () => {
  return useAtomCallback(
    useCallback((get) => get(comboAtom), []),
    { store }
  );
};

export const useCurrentTimeState = () => useAtomValue(currentTimeAtom, { store });
export const useSetCurrentTime = () => useSetAtom(currentTimeAtom, { store });
export const useReadCurrentTime = () => {
  return useAtomCallback(
    useCallback((get) => get(currentTimeAtom), []),
    { store }
  );
};

const lineResultListAtom = atomWithReset<LineResultData[]>([]);

export const useLineResultsState = () => useAtomValue(lineResultListAtom, { store });
export const useSetLineResults = () => useSetAtom(lineResultListAtom, { store });
export const useReadLineResults = () => {
  return useAtomCallback(
    useCallback((get) => get(lineResultListAtom), []),
    { store }
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

  const nextKpm = (inputMode === "roma" ? line.kpm["r"] : line.kpm["k"]) * speed.playSpeed;

  set(nextLyricsAtom, () => {
    if (line.kanaWord) {
      return {
        lyrics: typingOptions.next_display === "WORD" ? line.kanaWord : line["lyrics"],
        kpm: nextKpm.toFixed(0),
        kanaWord: line.kanaWord.slice(0, 60),
        romaWord: line.word
          .map((w) => w["r"][0])
          .join("")
          .slice(0, 60),
      };
    } else {
      return RESET;
    }
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
    { store }
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
      lyrics: newCurrentLine["lyrics"],
    });

    const nextTime = Number(newNextLine["time"]);

    const { movieDuration } = get(ytStatusAtom);
    const lineProgress = get(lineProgressAtom);

    if (lineProgress) {
      lineProgress.value = 0;
      lineProgress.max = (nextTime > movieDuration ? movieDuration : nextTime) - Number(newCurrentLine["time"]);
    }
  }
);

export const useSetCurrentLine = () => {
  const setCurrentLine = useSetAtom(writeCurrentLineAtom, { store });
  const resetCurrentLine = useCallback(() => {
    store.set(currentLineAtom, RESET);
    const map = store.get(mapAtom);
    const lineProgress = store.get(lineProgressAtom);

    if (lineProgress && map) {
      lineProgress.value = 0;
      lineProgress.max = map.mapData[1]["time"];
    }
  }, []);

  return { setCurrentLine, resetCurrentLine };
};

export type TypingStatusAtomValue = ExtractAtomValue<typeof typingStatusAtom>;
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
  const readMap = useReadMapState();
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
    { store }
  );
};
