import { RouterOutPuts } from "@/server/api/trpc";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";
import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, atomWithStorage, RESET } from "jotai/utils";
import { CreateMap } from "../../../lib/instanceMapData";
import { defaultLineWord } from "../ts/const/consts";
import {
  InputModeType,
  LineResultData,
  LineWord,
  NextLyricsType,
  SceneType,
  Speed,
} from "../ts/type";

const typeAtomStore = createStore();
export const getTypeAtomStore = () => typeAtomStore;

export const mapAtom = atom<CreateMap | null>(null);

export const useMapAtom = () => {
  return useAtomValue(mapAtom);
};

export const useSetMapAtom = () => {
  return useSetAtom(mapAtom);
};

export const mapInfoAtom = atom<RouterOutPuts["map"]["getMapInfo"]>(null);

export const useMapInfoAtom = () => {
  return useAtomValue(mapInfoAtom, { store: typeAtomStore });
};

export const sceneAtom = atomWithReset<SceneType>("ready");

export const useSceneAtom = () => {
  return useAtomValue(sceneAtom, { store: typeAtomStore });
};

export const useSetSceneAtom = () => {
  return useSetAtom(sceneAtom, { store: typeAtomStore });
};

export const hasLocalLikeAtom = atom<boolean>(false);

export const useHasLocalLikeAtom = () => {
  return useAtomValue(hasLocalLikeAtom, { store: typeAtomStore });
};

export const useSetHasLocalLikeAtom = () => {
  return useSetAtom(hasLocalLikeAtom, { store: typeAtomStore });
};

const tabIndexAtom = atomWithReset<0 | 1>(1);

export const useTabIndexAtom = () => {
  return useAtomValue(tabIndexAtom);
};

export const useSetTabIndexAtom = () => {
  return useSetAtom(tabIndexAtom);
};

export const readyRadioInputModeAtom = atomWithStorage<InputModeType>(
  "inputMode",
  "roma",
  undefined,
  {
    getOnInit: true,
  }
);

export const useReadyInputModeAtom = () => {
  return useAtomValue(readyRadioInputModeAtom, { store: typeAtomStore });
};

export const useReadySetInputModeAtom = () => {
  return useSetAtom(readyRadioInputModeAtom, { store: typeAtomStore });
};

const initialInputMode: InputModeType =
  typeof window !== "undefined"
    ? (localStorage.getItem("inputMode") as InputModeType) || "roma"
    : "roma";

export const playingInputModeAtom = atom<InputModeType>(initialInputMode);

export const usePlayingInputModeAtom = () => {
  return useAtomValue(playingInputModeAtom, { store: typeAtomStore });
};

export const useSetPlayingInputModeAtom = () => {
  return useSetAtom(playingInputModeAtom, { store: typeAtomStore });
};

export const isLoadingOverlayAtom = atom<boolean>(false);

export const useIsLoadingOverlayAtom = () => {
  return useAtomValue(isLoadingOverlayAtom);
};

export const useSetIsLoadingOverlayAtom = () => {
  return useSetAtom(isLoadingOverlayAtom);
};

const playingNotifyAtom = atomWithReset<symbol>(Symbol(""));

export const usePlayingNotifyAtom = () => {
  return useAtomValue(playingNotifyAtom);
};

export const useSetPlayingNotifyAtom = () => {
  return useSetAtom(playingNotifyAtom);
};

export const rankingScoresAtom = atomWithReset<number[]>([]);
export const useRankingScoresAtom = () => {
  return useAtomValue(rankingScoresAtom);
};

export const useSetRankingScoresAtom = () => {
  return useSetAtom(rankingScoresAtom);
};

export const lineResultsAtom = atom<LineResultData[]>([]);

export const useLineResultsAtom = () => {
  return useAtomValue(lineResultsAtom, { store: typeAtomStore });
};

export const useSetLineResultsAtom = () => {
  return useSetAtom(lineResultsAtom, { store: typeAtomStore });
};

export const lineSelectIndexAtom = atom<number>(0);

export const useLineSelectIndexAtom = () => {
  return useAtomValue(lineSelectIndexAtom);
};

export const useSetLineSelectIndexAtom = () => {
  return useSetAtom(lineSelectIndexAtom);
};

export const speedAtom = atomWithReset<Speed>({
  defaultSpeed: 1,
  playSpeed: 1,
});

export const usePlaySpeedAtom = () => {
  return useAtomValue(speedAtom, { store: typeAtomStore });
};

export const useSetPlaySpeedAtom = () => {
  return useSetAtom(speedAtom, { store: typeAtomStore });
};

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

export const useUserTypingOptionsAtom = () => {
  return useAtomValue(userTypingOptionsAtom, { store: typeAtomStore });
};

export const useSetUserTypingOptionsAtom = () => {
  return useSetAtom(userTypingOptionsAtom, { store: typeAtomStore });
};

export const timeOffsetAtom = atom<number>(0);

export const useTimeOffsetAtom = () => {
  return useAtomValue(timeOffsetAtom, { store: typeAtomStore });
};

export const useSetTimeOffsetAtom = () => {
  return useSetAtom(timeOffsetAtom, { store: typeAtomStore });
};
const lyricsAtom = atom<string>("");

export const useLyricsAtom = () => {
  return useAtomValue(lyricsAtom, { store: typeAtomStore });
};

export const useSetLyricsAtom = () => {
  return useSetAtom(lyricsAtom, { store: typeAtomStore });
};
const nextLyricsAtom = atom<NextLyricsType>({
  lyrics: "",
  kpm: "",
  kanaWord: "",
  romaWord: "",
});

export const useNextLyricsAtom = () => {
  return useAtomValue(nextLyricsAtom, { store: typeAtomStore });
};

export const useSetNextLyricsAtom = () => {
  return useSetAtom(nextLyricsAtom, { store: typeAtomStore });
};

export const lineWordAtom = atom<LineWord>({ ...defaultLineWord });

export const useLineWordAtom = () => {
  return useAtomValue(lineWordAtom, { store: typeAtomStore });
};

export const useSetLineWordAtom = () => {
  return useSetAtom(lineWordAtom, { store: typeAtomStore });
};

export const skipAtom = atom<"Space" | "">("");

export const useSkipAtom = () => {
  return useAtomValue(skipAtom, { store: typeAtomStore });
};

export const useSetSkipAtom = () => {
  return useSetAtom(skipAtom, { store: typeAtomStore });
};

export const currentTimeSSMMAtom = atom(0);

export const useCurrentTimeSSMMAtom = () => {
  return useAtomValue(currentTimeSSMMAtom, { store: typeAtomStore });
};

export const useSetCurrentTimeSSMMAtom = () => {
  return useSetAtom(currentTimeSSMMAtom, { store: typeAtomStore });
};

const displayLineRemainTimeAtom = atom(0);

export const useDisplayLineRemainTimeAtom = () => {
  return useAtomValue(displayLineRemainTimeAtom, { store: typeAtomStore });
};

export const useSetDisplayLineRemainTimeAtom = () => {
  return useSetAtom(displayLineRemainTimeAtom, { store: typeAtomStore });
};
const displayLineKpmAtom = atom(0);

export const useDisplayLineKpmAtom = () => {
  return useAtomValue(displayLineKpmAtom, { store: typeAtomStore });
};

export const useSetDisplayLineKpmAtom = () => {
  return useSetAtom(displayLineKpmAtom, { store: typeAtomStore });
};

export const comboAtom = atom(0);

export const useComboAtom = () => {
  return useAtomValue(comboAtom, { store: typeAtomStore });
};

export const useSetComboAtom = () => {
  return useSetAtom(comboAtom, { store: typeAtomStore });
};

export const changeCSSCountAtom = atom<number>(0);

export const useChangeCSSCountAtom = () => {
  return useAtomValue(changeCSSCountAtom, { store: typeAtomStore });
};

export const useSetChangeCSSCountAtom = () => {
  return useSetAtom(changeCSSCountAtom, { store: typeAtomStore });
};

export const isOptionEditedAtom = atom<boolean>(false);

export const useSetIsOptionEdited = () => {
  return useSetAtom(isOptionEditedAtom, { store: typeAtomStore });
};

export const mapUpdatedAtAtom = atom<Date>(new Date());

export const drawerClosureAtom = atom<UseDisclosureReturn | null>(null);

export const useSetDrawerClosureAtom = () => {
  return useSetAtom(drawerClosureAtom, { store: typeAtomStore });
};

export const typingStatusAtom = atomWithReset({
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

export const useTypingStatusAtom = () => {
  return useAtomValue(typingStatusAtom, { store: typeAtomStore });
};

export const useSetTypingStatusAtom = () => {
  return useSetAtom(typingStatusAtom, { store: typeAtomStore });
};

export const useSetTypingStatusAtoms = () => {
  const map = useMapAtom();
  const rankingScores = useRankingScoresAtom();

  const setTypingStatus = useSetAtom(typingStatusAtom, { store: typeAtomStore });
  const setLineCount = useSetAtom(focusTypingStatusAtoms.line, { store: typeAtomStore });
  const setRank = useSetAtom(focusTypingStatusAtoms.rank, { store: typeAtomStore });

  const resetTypingStatus = () => {
    setTypingStatus(RESET);
    setLineCount(map?.lineLength || 0);
    setRank(rankingScores.length + 1);
  };

  return { setTypingStatus, resetTypingStatus };
};
