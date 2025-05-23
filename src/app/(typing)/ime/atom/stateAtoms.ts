import { RouterOutPuts } from "@/server/api/trpc";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { DISPLAY_LINE_LENGTH } from "../ts/const";
import { ParseMap, PlaceholderType, SceneType, WordResults } from "../type";
import { getImeTypeAtomStore } from "./store";

const store = getImeTypeAtomStore();

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
export const useReadMap = () => {
  return useAtomCallback(
    useCallback((get) => get(mapAtom) as NonNullable<ParseMap>, []),
    { store }
  );
};

export const sceneAtom = atomWithReset<SceneType>("ready");
export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSetScene = () => useSetAtom(sceneAtom, { store });
export const useReadScene = () => {
  return useAtomCallback(
    useCallback((get) => get(sceneAtom), []),
    { store }
  );
};

const gameStateUtilParamsAtom = atomWithReset({
  skipRemainTime: null as number | null,
  count: 0,
  wipeCount: 0,
  displayLines: new Array(DISPLAY_LINE_LENGTH).fill([]) as ParseMap["lines"][number][],
  nextDisplayLine: [] as ParseMap["lines"][number],
  judgedWords: [] as string[][][],
  textareaPlaceholderType: "normal" as PlaceholderType,
  typeTimeStatsAccumulationEnabled: false,
});

export const useReadGameUtilParams = () => {
  const readGameUtilParams = useAtomCallback(
    useCallback((get) => get(gameStateUtilParamsAtom), []),
    { store }
  );

  const readWipeLine = useAtomCallback(
    useCallback((get) => {
      const displayLines = get(displayLinesAtom);

      return displayLines[displayLines.length - 1];
    }, []),
    { store }
  );

  return { readGameUtilParams, readWipeLine };
};

export const useResetGameUtilParams = () => {
  return useAtomCallback(
    useCallback((get, set) => {
      set(gameStateUtilParamsAtom, RESET);
    }, []),
    { store }
  );
};

const skipRemainTimeAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("skipRemainTime"));
const countAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("count"));
const wipeCountAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("wipeCount"));
const displayLinesAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("displayLines"));
const nextDisplayLineAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("nextDisplayLine"));
const judgedWordsAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("judgedWords"));
const textareaPlaceholderTypeAtom = focusAtom(gameStateUtilParamsAtom, (optic) =>
  optic.prop("textareaPlaceholderType")
);
const typeTimeStatsAccumulationEnabled = focusAtom(gameStateUtilParamsAtom, (optic) =>
  optic.prop("typeTimeStatsAccumulationEnabled")
);

export const useCountState = () => useAtomValue(countAtom, { store });
export const useSkipRemainTimeState = () => useAtomValue(skipRemainTimeAtom, { store });
export const useDisplayLinesState = () => useAtomValue(displayLinesAtom, { store });
export const useNextDisplayLineState = () => useAtomValue(nextDisplayLineAtom, { store });
export const useTextareaPlaceholderTypeState = () => useAtomValue(textareaPlaceholderTypeAtom, { store });

export const useSetSkipRemainTime = () => useSetAtom(skipRemainTimeAtom, { store });
export const useSetWipeCount = () => useSetAtom(wipeCountAtom, { store });
export const useSetCount = () => useSetAtom(countAtom, { store });
export const useSetDisplayLines = () => useSetAtom(displayLinesAtom, { store });
export const useSetNextDisplayLine = () => useSetAtom(nextDisplayLineAtom, { store });
export const useSetJudgedWords = () => useSetAtom(judgedWordsAtom, { store });
export const useSetTextareaPlaceholderType = () => useSetAtom(textareaPlaceholderTypeAtom, { store });
export const useSetTypeTimeStatsAccumulationEnabled = () => useSetAtom(typeTimeStatsAccumulationEnabled, { store });

const statusAtom = atomWithReset({ typeCount: 0, score: 0, wordIndex: 0 });
export const useStatusState = () => useAtomValue(statusAtom, { store });
export const useSetStatus = () => useSetAtom(statusAtom, { store });
export const useReadStatus = () => {
  return useAtomCallback(
    useCallback((get) => get(statusAtom), []),
    { store }
  );
};

const wordResultsAtom = atomWithReset([] as WordResults);

export const useWordResultsState = () => useAtomValue(wordResultsAtom, { store });
export const useReadWordResults = () => {
  return useAtomCallback(
    useCallback((get) => get(wordResultsAtom), []),
    { store }
  );
};

const updateResultsAtom = atom(null, (get, set, updateResult: { index: number; result: WordResults[number] }) => {
  const { index, result } = updateResult;

  set(wordResultsAtom, (prev) => {
    const newResults = [...prev];

    if (newResults[index]) {
      newResults[index] = result;
    }
    return newResults;
  });
});
const initResultsAtom = atom(null, (get, set) => {
  const map = get(mapAtom);
  if (map) {
    set(wordResultsAtom, map.initWordResults);
  }
});

export const useInitWordResults = () => useSetAtom(initResultsAtom, { store });
export const useUpdateWordResults = () => useSetAtom(updateResultsAtom, { store });

const notificationsAtom = atomWithReset<string[]>([]);

export const useNotificationsState = () => useAtomValue(notificationsAtom, { store });
export const useSetNotifications = () => useSetAtom(notificationsAtom, { store });

const resultDialogAtom = atom(false);

export const useResultDialogDisclosure = () => {
  const open = useAtomValue(resultDialogAtom, { store });

  const onOpen = () => {
    store.set(resultDialogAtom, true);
  };

  const onClose = () => {
    store.set(resultDialogAtom, false);
  };

  return { open, onOpen, onClose };
};
