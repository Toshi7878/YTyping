import { RouterOutPuts } from "@/server/api/trpc";
import { ParseMap } from "@/util/parseMap";
import { $Enums } from "@prisma/client";
import { atom, ExtractAtomValue, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputMode, LineData, LineResultData, LineWord, SceneType } from "../ts/type";
import { lineProgressRefAtom, useGameUtilsRef, ytStatusRefAtom } from "./refAtoms";
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
  type_sound: false,
  miss_sound: false,
  line_clear_sound: false,
  next_display: "LYRICS" as $Enums.next_display,
  line_completed_display: "NEXT_WORD" as $Enums.line_completed_display,
  time_offset_key: "CTRL_LEFT_RIGHT" as $Enums.time_offset_key,
  toggle_input_mode_key: "ALT_KANA" as $Enums.toggle_input_mode_key,
});

export const useUserTypingOptionsState = () => useAtomValue(userTypingOptionsAtom, { store });
export const useSetUserTypingOptionsState = () => useSetAtom(userTypingOptionsAtom, { store });
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
export const useSetMapState = () => useSetAtom(mapAtom, { store });
export const useMapStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(mapAtom) as ParseMap, []),
    { store }
  );
};

const gameStateUtilsAtom = atomWithReset({
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

export const sceneAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("scene"));
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
const tabIndexAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("tabIndex"));
export const notifyAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("notify"));
const skipAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("skip"));
const changeCSSCountAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("changeCSSCount"));
const lineSelectIndexAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("lineSelectIndex"));
const isLoadingOverlayAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("isLoadingOverlay"));
const playingInputModeAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("inputMode"));
const isYTStartedAtom = focusAtom(gameStateUtilsAtom, (optic) => optic.prop("isYTStarted"));

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

export const useGameStateUtilsRef = () => {
  return useAtomCallback(
    useCallback((get) => get(gameStateUtilsAtom), []),
    { store }
  );
};

export const useSetGameUtilsState = () => useSetAtom(gameStateUtilsAtom, { store });

export const useTabIndexState = () => useAtomValue(tabIndexAtom);
export const useSetTabIndexState = () => useSetAtom(tabIndexAtom);

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSceneGroupState = () => useAtomValue(sceneGroupAtom, { store });
export const useSetSceneState = () => useSetAtom(writeSceneAtom, { store });

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const useSetPlayingInputModeState = () => useSetAtom(playingInputModeAtom, { store });

export const useIsLoadingOverlayState = () => useAtomValue(isLoadingOverlayAtom);
export const useSetIsLoadingOverlayState = () => useSetAtom(isLoadingOverlayAtom);

export const useSkipState = () => useAtomValue(skipAtom, { store });
export const useSetSkipState = () => useSetAtom(skipAtom, { store });

export const useNotifyState = () => useAtomValue(notifyAtom);
export const useSetNotifyState = () => useSetAtom(notifyAtom);

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store });
export const useSetChangeCSSCountState = () => useSetAtom(writeChangeCSSCountAtom, { store });

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom);
export const useSetLineSelectIndexState = () => useSetAtom(lineSelectIndexAtom);

export const useYTStartedState = () => useAtomValue(isYTStartedAtom);
export const useSetYTStartedState = () => useSetAtom(isYTStartedAtom);

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
export const useSetLineRemainTimeState = () => useSetAtom(lineRemainTimeAtom, { store });

export const useLineKpmState = () => useAtomValue(lineKpmAtom, { store });
export const useSetLineKpmState = () => useSetAtom(lineKpmAtom, { store });
export const useLineKpmStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineKpmAtom), []),
    { store }
  );
};

export const useComboState = () => useAtomValue(comboAtom, { store });
export const useSetComboState = () => useSetAtom(comboAtom, { store });
export const useComboStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(comboAtom), []),
    { store }
  );
};

export const useCurrentTimeState = () => useAtomValue(currentTimeAtom, { store });
export const useSetCurrentTimeState = () => useSetAtom(currentTimeAtom, { store });
export const useCurrentTimeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(currentTimeAtom), []),
    { store }
  );
};

const lineResultListAtom = atomWithReset<LineResultData[]>([]);

export const useLineResultsState = () => useAtomValue(lineResultListAtom, { store });
export const useSetLineResultsState = () => useSetAtom(lineResultListAtom, { store });
export const useLineResultsStateRef = () => {
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

  set(nextLyricsAtom, {
    lyrics: typingOptions.next_display === "WORD" ? line.kanaWord : line["lyrics"],
    kpm: nextKpm.toFixed(0),
    kanaWord: line.kanaWord.slice(0, 60),
    romaWord: line.word
      .map((w) => w["r"][0])
      .join("")
      .slice(0, 60),
  });
});

export const useNextLyricsState = () => useAtomValue(nextLyricsAtom, { store });
export const useSetNextLyricsState = () => {
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
export const useSetLineWordState = () => useSetAtom(lineWordAtom, { store });
export const useLineWordStateRef = () => {
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

    const { movieDuration } = get(ytStatusRefAtom);
    const lineProgress = get(lineProgressRefAtom);

    if (lineProgress) {
      lineProgress.value = 0;
      lineProgress.max = (nextTime > movieDuration ? movieDuration : nextTime) - Number(newCurrentLine["time"]);
    }
  }
);

export const useSetCurrentLineState = () => {
  const setCurrentLine = useSetAtom(writeCurrentLineAtom, { store });
  const resetCurrentLine = useCallback(() => {
    store.set(currentLineAtom, RESET);
    const map = store.get(mapAtom);
    const lineProgress = store.get(lineProgressRefAtom);

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

export const useSetTypingStatusLineState = () => useSetAtom(focusTypingStatusAtoms.line, { store });
export const useSetTypingStatusRankState = () => useSetAtom(focusTypingStatusAtoms.rank, { store });
export const useTypingStatusState = () => useAtomValue(typingStatusAtom, { store });
export const useSetTypingStatusState = () => {
  const readMap = useMapStateRef();
  const { readGameUtils } = useGameUtilsRef();
  const setTypingStatus = useSetAtom(typingStatusAtom, { store });
  const setLineCount = useSetTypingStatusLineState();
  const setRank = useSetTypingStatusRankState();

  const resetTypingStatus = () => {
    setTypingStatus(RESET);
    setLineCount(readMap()?.lineLength || 0);

    const { rankingScores } = readGameUtils();
    setRank(rankingScores.length + 1);
  };

  return { setTypingStatus, resetTypingStatus };
};
export const useTypingStatusStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(typingStatusAtom), []),
    { store }
  );
};
