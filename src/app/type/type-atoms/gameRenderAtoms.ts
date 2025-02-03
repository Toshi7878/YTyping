import { RouterOutPuts } from "@/server/api/trpc";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, atomWithStorage } from "jotai/utils";
import { CreateMap } from "../../../lib/instanceMapData";
import { defaultLineWord } from "../ts/const/consts";
import { DEFAULT_SPEED, DEFAULT_USER_OPTIONS } from "../ts/const/typeDefaultValue";
import {
  InputModeType,
  LineResultData,
  LineWord,
  NextLyricsType,
  SceneType,
  Speed,
  useSetStatusValueProps,
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

export const rankingScoresAtom = atom<number[]>([]);
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

export const speedAtom = atom<Speed>(DEFAULT_SPEED);

export const useTypePageSpeedAtom = () => {
  return useAtomValue(speedAtom, { store: typeAtomStore });
};

export const useSetTypePageSpeedAtom = () => {
  return useSetAtom(speedAtom, { store: typeAtomStore });
};

export const userOptionsAtom = atom(DEFAULT_USER_OPTIONS);

export const useUserOptionsAtom = () => {
  return useAtomValue(userOptionsAtom, { store: typeAtomStore });
};

export const useSetUserOptionsAtom = () => {
  return useSetAtom(userOptionsAtom, { store: typeAtomStore });
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

// Status Atoms

const scoreAtom = atomWithReset(0);
const typeAtom = atomWithReset(0);
const totalKpmAtom = atomWithReset(0);
const rankAtom = atomWithReset(0);
const pointAtom = atomWithReset(0);
const missAtom = atomWithReset(0);
const lostAtom = atomWithReset(0);
const lineCountAtom = atomWithReset(0);
const timeBonusAtom = atomWithReset(0);

export const statusAtoms = {
  score: scoreAtom,
  type: typeAtom,
  kpm: totalKpmAtom,
  rank: rankAtom,
  point: pointAtom,
  miss: missAtom,
  lost: lostAtom,
  line: lineCountAtom,
  timeBonus: timeBonusAtom,
};

export const useStatusAtomsValues = () => {
  return () => {
    return {
      score: typeAtomStore.get(scoreAtom),
      type: typeAtomStore.get(typeAtom),
      kpm: typeAtomStore.get(totalKpmAtom),
      rank: typeAtomStore.get(rankAtom),
      point: typeAtomStore.get(pointAtom),
      miss: typeAtomStore.get(missAtom),
      lost: typeAtomStore.get(lostAtom),
      line: typeAtomStore.get(lineCountAtom),
      timeBonus: typeAtomStore.get(timeBonusAtom),
    };
  };
};

export const useSetStatusAtoms = () => {
  const statusSetters = {
    score: useSetAtom(scoreAtom, { store: typeAtomStore }),
    type: useSetAtom(typeAtom, { store: typeAtomStore }),
    kpm: useSetAtom(totalKpmAtom, { store: typeAtomStore }),
    rank: useSetAtom(rankAtom, { store: typeAtomStore }),
    point: useSetAtom(pointAtom, { store: typeAtomStore }),
    miss: useSetAtom(missAtom, { store: typeAtomStore }),
    lost: useSetAtom(lostAtom, { store: typeAtomStore }),
    line: useSetAtom(lineCountAtom, { store: typeAtomStore }),
    timeBonus: useSetAtom(timeBonusAtom, { store: typeAtomStore }),
  };
  const map = useMapAtom();
  const rankingScores = useRankingScoresAtom();

  const setStatusValues = (props: useSetStatusValueProps) => {
    if (props.score !== undefined) {
      statusSetters.score(props.score);
    }
    if (props.type !== undefined) {
      statusSetters.type(props.type);
    }
    if (props.kpm !== undefined) {
      statusSetters.kpm(props.kpm);
    }
    if (props.rank !== undefined) {
      statusSetters.rank(props.rank);
    }
    if (props.point !== undefined) {
      statusSetters.point(props.point);
    }
    if (props.miss !== undefined) {
      statusSetters.miss(props.miss);
    }
    if (props.lost !== undefined) {
      statusSetters.lost(props.lost);
    }
    if (props.line !== undefined) {
      statusSetters.line(props.line);
    }
    if (props.timeBonus !== undefined) {
      statusSetters.timeBonus(props.timeBonus);
    }
  };

  // 新しい関数: statusValuesをリセットする
  const resetStatusValues = () => {
    statusSetters.score(0);
    statusSetters.type(0);
    statusSetters.kpm(0);
    statusSetters.point(0);
    statusSetters.miss(0);
    statusSetters.lost(0);
    statusSetters.rank(rankingScores.length + 1);
    statusSetters.line(map?.lineLength || 0);
    statusSetters.timeBonus(0);
  };

  return { setStatusValues, resetStatusValues };
};
