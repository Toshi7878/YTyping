import { CreateMap } from "@/lib/instanceMapData";
import { RouterOutPuts } from "@/server/api/trpc";
import { $Enums } from "@prisma/client";
import { atom, ExtractAtomValue, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputMode, LineResultData, LineWord, SceneType } from "../ts/type";
import { useGameUtilsRef } from "./refAtoms";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const initialInputMode: InputMode =
  typeof window !== "undefined" ? (localStorage.getItem("inputMode") as InputMode) || "roma" : "roma";

export const userTypingOptionsAtom = atomWithReset({
  time_offset: 0,
  kana_word_scroll: 10,
  roma_word_scroll: 16,
  type_sound: false,
  miss_sound: false,
  line_clear_sound: false,
  next_display: "LYRICS" as $Enums.next_display,
  line_completed_display: "HIGH_LIGHT" as $Enums.line_completed_display,
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

const mapLikeFocusAtom = focusAtom(mapInfoAtom, (optic) =>
  optic.valueOr({} as { isLiked: undefined }).prop("isLiked")
);
export const useIsLikeAtom = () => useAtomValue(mapLikeFocusAtom, { store });
export const useSetIsLikeAtom = () => useSetAtom(mapLikeFocusAtom, { store });

const mapAtom = atomWithReset<CreateMap | null>(null);
export const useMapState = () => useAtomValue(mapAtom, { store }) as CreateMap;
export const useSetMapState = () => useSetAtom(mapAtom, { store });
export const useMapStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(mapAtom) as CreateMap, []),
    { store }
  );
};

const gameUtilsStateAtom = atomWithReset({
  scene: "ready" as SceneType,
  tabIndex: 1 as 0 | 1,
  playingInputMode: initialInputMode,
  notify: Symbol(""),
  skip: "Space" as "Space" | "",
  changeCSSCount: 0,
  isLoadingOverlay: false,
  lineSelectIndex: 0,
});
export const sceneAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("scene"));
const tabIndexAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("tabIndex"));
export const notifyAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("notify"));
const skipAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("skip"));
const changeCSSCountAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("changeCSSCount"));
const lineSelectIndexAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("lineSelectIndex"));
const isLoadingOverlayAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("isLoadingOverlay"));
const playingInputModeAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("playingInputMode"));

export const useSetGameUtilsState = () => useSetAtom(gameUtilsStateAtom, { store });

export const useTabIndexState = () => useAtomValue(tabIndexAtom);
export const useSetTabIndexState = () => useSetAtom(tabIndexAtom);

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSetSceneState = () => useSetAtom(sceneAtom, { store });
export const useSceneStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(sceneAtom), []),
    { store }
  );
};

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const useSetPlayingInputModeState = () => useSetAtom(playingInputModeAtom, { store });
export const usePlayingInputModeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(playingInputModeAtom), []),
    { store }
  );
};

export const useIsLoadingOverlayState = () => useAtomValue(isLoadingOverlayAtom);
export const useSetIsLoadingOverlayState = () => useSetAtom(isLoadingOverlayAtom);
export const useIsLoadingOverlayStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isLoadingOverlayAtom), []),
    { store }
  );
};

export const useSkipState = () => useAtomValue(skipAtom, { store });
export const useSetSkipState = () => useSetAtom(skipAtom, { store });
export const useSkipStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(skipAtom), []),
    { store }
  );
};

export const useNotifyState = () => useAtomValue(notifyAtom);
export const useSetNotifyState = () => useSetAtom(notifyAtom);

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store });
export const useSetChangeCSSCountState = () => useSetAtom(changeCSSCountAtom, { store });

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom);
export const useSetLineSelectIndexState = () => useSetAtom(lineSelectIndexAtom);
export const useLineSelectIndexStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineSelectIndexAtom), []),
    { store }
  );
};

const playingStateAtom = atomWithReset({
  currentTime: 0,
  lineRemainTime: 0,
  lineKpm: 0,
  combo: 0,
  lyrics: "",
});

const lyricsAtom = focusAtom(playingStateAtom, (optic) => optic.prop("lyrics"));
const currentTimeAtom = focusAtom(playingStateAtom, (optic) => optic.prop("currentTime"));
const lineRemainTimeAtom = focusAtom(playingStateAtom, (optic) => optic.prop("lineRemainTime"));
const lineKpmAtom = focusAtom(playingStateAtom, (optic) => optic.prop("lineKpm"));
const comboAtom = focusAtom(playingStateAtom, (optic) => optic.prop("combo"));

export const useLyricsState = () => useAtomValue(lyricsAtom, { store });
export const useSetLyricsState = () => useSetAtom(lyricsAtom, { store });

export const useLineRemainTimeState = () => useAtomValue(lineRemainTimeAtom, { store });
export const useSetLineRemainTimeState = () => useSetAtom(lineRemainTimeAtom, { store });

export const useLineKpmState = () => useAtomValue(lineKpmAtom, { store });
export const useSetLineKpmState = () => useSetAtom(lineKpmAtom, { store });

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

const lineResultsAtom = atomWithReset<LineResultData[]>([]);
export const useLineResultsState = () => useAtomValue(lineResultsAtom, { store });
export const useSetLineResultsState = () => useSetAtom(lineResultsAtom, { store });
export const useLineResultsStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineResultsAtom), []),
    { store }
  );
};

const nextLyricsAtom = atomWithReset({
  lyrics: "",
  kpm: "",
  kanaWord: "",
  romaWord: "",
});

export const useNextLyricsState = () => useAtomValue(nextLyricsAtom, { store });
export const useSetNextLyricsState = () => useSetAtom(nextLyricsAtom, { store });

const lineWordAtom = atomWithReset<LineWord>({
  correct: { k: "", r: "" },
  nextChar: { k: "", r: [""], p: 0, t: undefined },
  word: [{ k: "", r: [""], p: 0, t: undefined }],
  lineCount: 0,
});

export const useLineWordState = () => useAtomValue(lineWordAtom, { store });
export const useSetLineWordState = () => useSetAtom(lineWordAtom, { store });
export const useLineWordStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineWordAtom), []),
    { store }
  );
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
  const map = useMapState() as CreateMap | null;
  const { readGameUtils } = useGameUtilsRef();
  const setTypingStatus = useSetAtom(typingStatusAtom, { store });
  const setLineCount = useSetTypingStatusLineState();
  const setRank = useSetTypingStatusRankState();

  const resetTypingStatus = () => {
    setTypingStatus(RESET);
    setLineCount(map?.lineLength || 0);

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
