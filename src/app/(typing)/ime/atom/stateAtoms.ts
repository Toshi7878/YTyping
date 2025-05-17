import { RouterOutPuts } from "@/server/api/trpc";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { DISPLAY_LINE_LENGTH } from "../ts/const";
import { ParseMap, SceneType, WordsResult } from "../type";
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

const gameStateUtilParamsAtom = atomWithReset({
  scene: "ready" as SceneType,
  skipRemainTime: null as number | null,
});

export const sceneAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("scene"));
const skipRemainTimeAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("skipRemainTime"));

export const useSkipRemainTimeState = () => useAtomValue(skipRemainTimeAtom, { store });
export const useSetSkipRemainTime = () => useSetAtom(skipRemainTimeAtom, { store });

export const useReadGameUtilParams = () => {
  return useAtomCallback(
    useCallback((get) => get(gameStateUtilParamsAtom), []),
    { store }
  );
};

export const useSetGameUtilParams = () => useSetAtom(gameStateUtilParamsAtom, { store });

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSetScene = () => useSetAtom(sceneAtom, { store });

const displayLinesAtom = atomWithReset<ParseMap["lines"][number][]>(Array(DISPLAY_LINE_LENGTH).fill([]));
export const useDisplayLinesState = () => useAtomValue(displayLinesAtom, { store });
export const useSetDisplayLines = () => useSetAtom(displayLinesAtom, { store });
export const useReadDisplayLines = () => {
  const readDisplayLines = useAtomCallback(
    useCallback((get) => get(displayLinesAtom), []),
    { store }
  );
  const readWipeLine = useAtomCallback(
    useCallback((get) => {
      const displayLines = get(displayLinesAtom);

      return displayLines[displayLines.length - 1];
    }, []),
    { store }
  );

  return { readDisplayLines, readWipeLine };
};

const nextDisplayLineAtom = atomWithReset<ParseMap["lines"][number]>([]);

export const useNextDisplayLineState = () => useAtomValue(nextDisplayLineAtom, { store });
export const useSetNextDisplayLine = () => useSetAtom(nextDisplayLineAtom, { store });
export const useReadNextDisplayLine = () => {
  return useAtomCallback(
    useCallback((get) => get(nextDisplayLineAtom), []),
    { store }
  );
};

const statusAtom = atomWithReset({ typeCount: 0, score: 0, wordIndex: 0, wordsResult: [] as WordsResult });

export const useStatusState = () => useAtomValue(statusAtom, { store });
export const useSetStatus = () => useSetAtom(statusAtom, { store });

export const useReadStatus = () => {
  return useAtomCallback(
    useCallback((get) => get(statusAtom), []),
    { store }
  );
};

const judgedWordsAtom = atomWithReset([] as string[][][]);

export const useSetJudgedWords = () => useSetAtom(judgedWordsAtom, { store });
export const useReadJudgedWords = () => {
  return useAtomCallback(
    useCallback((get) => get(judgedWordsAtom), []),
    { store }
  );
};

const notificationsAtom = atomWithReset<string[]>([]);

export const useNotificationsState = () => useAtomValue(notificationsAtom, { store });
export const useSetNotifications = () => useSetAtom(notificationsAtom, { store });
