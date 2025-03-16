import { CreateMap } from "@/lib/instanceMapData";
import { $Enums } from "@prisma/client";
import { atom, createStore, ExtractAtomValue, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, atomWithStorage, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { InputModeType, LineResultData, LineWord, SceneType, Speed } from "../ts/type";
import { mapInfoAtom, useGameUtilsRef } from "./refAtoms";
const typeAtomStore = createStore();
export const getTypeAtomStore = () => typeAtomStore;
const initialInputMode: InputModeType =
  typeof window !== "undefined" ? (localStorage.getItem("inputMode") as InputModeType) || "roma" : "roma";

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

const mapLikeFocusAtom = focusAtom(mapInfoAtom, (optic) =>
  optic.valueOr({} as { isLiked: undefined }).prop("isLiked")
);

const mapAtom = atom<CreateMap | null>(null);

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
const sceneAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("scene"));
const tabIndexAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("tabIndex"));
const notifyAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("notify"));
const skipAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("skip"));
const changeCSSCountAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("changeCSSCount"));
const lineSelectIndexAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("lineSelectIndex"));
const isLoadingOverlayAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("isLoadingOverlay"));
const playingInputModeAtom = focusAtom(gameUtilsStateAtom, (optic) => optic.prop("playingInputMode"));

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

const readyRadioInputModeAtom = atomWithStorage<InputModeType>("inputMode", "roma", undefined, {
  getOnInit: true,
});

const lineResultsAtom = atomWithReset<LineResultData[]>([]);

const speedAtom = atomWithReset<Speed>({
  defaultSpeed: 1,
  playSpeed: 1,
});

const nextLyricsAtom = atomWithReset({
  lyrics: "",
  kpm: "",
  kanaWord: "",
  romaWord: "",
});

const lineWordAtom = atomWithReset<LineWord>({
  correct: { k: "", r: "" },
  nextChar: { k: "", r: [""], p: 0, t: undefined },
  word: [{ k: "", r: [""], p: 0, t: undefined }],
  lineCount: 0,
});

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

export const useMapState = () => useAtomValue(mapAtom, { store: typeAtomStore }) as CreateMap;
export const useSetMapState = () => useSetAtom(mapAtom, { store: typeAtomStore });

export const useIsLikeAtom = () => useAtomValue(mapLikeFocusAtom, { store: typeAtomStore });
export const useSetIsLikeAtom = () => useSetAtom(mapLikeFocusAtom, { store: typeAtomStore });

export const useSetGameUtilsState = () => useSetAtom(gameUtilsStateAtom, { store: typeAtomStore });

export const useSceneState = () => useAtomValue(sceneAtom, { store: typeAtomStore });
export const useSetSceneState = () => useSetAtom(sceneAtom, { store: typeAtomStore });
export const useSceneStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(sceneAtom), []),
    { store: typeAtomStore }
  );
};

export const useTabIndexState = () => useAtomValue(tabIndexAtom);
export const useSetTabIndexState = () => useSetAtom(tabIndexAtom);

export const useReadyInputModeState = () => useAtomValue(readyRadioInputModeAtom, { store: typeAtomStore });
export const useSetReadyInputModeState = () => useSetAtom(readyRadioInputModeAtom, { store: typeAtomStore });
export const useReadyInputModeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(readyRadioInputModeAtom), []),
    { store: typeAtomStore }
  );
};

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store: typeAtomStore });
export const useSetPlayingInputModeState = () => useSetAtom(playingInputModeAtom, { store: typeAtomStore });
export const usePlayingInputModeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(playingInputModeAtom), []),
    { store: typeAtomStore }
  );
};

export const useIsLoadingOverlayState = () => useAtomValue(isLoadingOverlayAtom);
export const useSetIsLoadingOverlayState = () => useSetAtom(isLoadingOverlayAtom);
export const useIsLoadingOverlayStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(isLoadingOverlayAtom), []),
    { store: typeAtomStore }
  );
};

export const useNotifyState = () => useAtomValue(notifyAtom);
export const useSetNotifyState = () => useSetAtom(notifyAtom);

export const useLineResultsState = () => useAtomValue(lineResultsAtom, { store: typeAtomStore });
export const useSetLineResultsState = () => useSetAtom(lineResultsAtom, { store: typeAtomStore });
export const useLineResultsStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineResultsAtom), []),
    { store: typeAtomStore }
  );
};

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom);
export const useSetLineSelectIndexState = () => useSetAtom(lineSelectIndexAtom);
export const useLineSelectIndexStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineSelectIndexAtom), []),
    { store: typeAtomStore }
  );
};

export const usePlaySpeedState = () => useAtomValue(speedAtom, { store: typeAtomStore });
export const useSetPlaySpeedState = () => useSetAtom(speedAtom, { store: typeAtomStore });
export const usePlaySpeedStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(speedAtom), []),
    { store: typeAtomStore }
  );
};

export const useUserTypingOptionsState = () => useAtomValue(userTypingOptionsAtom, { store: typeAtomStore });
export const useSetUserTypingOptionsState = () => useSetAtom(userTypingOptionsAtom, { store: typeAtomStore });
export const useUserTypingOptionsStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(userTypingOptionsAtom), []),
    { store: typeAtomStore }
  );
};

export const useLyricsState = () => useAtomValue(lyricsAtom, { store: typeAtomStore });
export const useSetLyricsState = () => useSetAtom(lyricsAtom, { store: typeAtomStore });

export const useNextLyricsState = () => useAtomValue(nextLyricsAtom, { store: typeAtomStore });
export const useSetNextLyricsState = () => useSetAtom(nextLyricsAtom, { store: typeAtomStore });

export const useLineWordState = () => useAtomValue(lineWordAtom, { store: typeAtomStore });
export const useSetLineWordState = () => useSetAtom(lineWordAtom, { store: typeAtomStore });
export const useLineWordStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineWordAtom), []),
    { store: typeAtomStore }
  );
};

export const useSkipState = () => useAtomValue(skipAtom, { store: typeAtomStore });
export const useSetSkipState = () => useSetAtom(skipAtom, { store: typeAtomStore });
export const useSkipStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(skipAtom), []),
    { store: typeAtomStore }
  );
};

export const useCurrentTimeState = () => useAtomValue(currentTimeAtom, { store: typeAtomStore });
export const useSetCurrentTimeState = () => useSetAtom(currentTimeAtom, { store: typeAtomStore });
export const useCurrentTimeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(currentTimeAtom), []),
    { store: typeAtomStore }
  );
};

export const useLineRemainTimeState = () => useAtomValue(lineRemainTimeAtom, { store: typeAtomStore });
export const useSetLineRemainTimeState = () => useSetAtom(lineRemainTimeAtom, { store: typeAtomStore });

export const useLineKpmState = () => useAtomValue(lineKpmAtom, { store: typeAtomStore });
export const useSetLineKpmState = () => useSetAtom(lineKpmAtom, { store: typeAtomStore });

export const useComboState = () => useAtomValue(comboAtom, { store: typeAtomStore });
export const useSetComboState = () => useSetAtom(comboAtom, { store: typeAtomStore });
export const useComboStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(comboAtom), []),
    { store: typeAtomStore }
  );
};

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store: typeAtomStore });
export const useSetChangeCSSCountState = () => useSetAtom(changeCSSCountAtom, { store: typeAtomStore });

export const useTypingStatusState = () => useAtomValue(typingStatusAtom, { store: typeAtomStore });
export const useSetTypingStatusState = () => {
  const map = useMapState() as CreateMap | null;
  const { readGameUtils } = useGameUtilsRef();

  const setTypingStatus = useSetAtom(typingStatusAtom, { store: typeAtomStore });
  const setLineCount = useSetAtom(focusTypingStatusAtoms.line, { store: typeAtomStore });
  const setRank = useSetAtom(focusTypingStatusAtoms.rank, { store: typeAtomStore });

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
    { store: typeAtomStore }
  );
};
