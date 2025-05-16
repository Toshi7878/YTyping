import { RouterOutPuts } from "@/server/api/trpc";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { DISPLAY_LINE_LENGTH } from "../ts/const";
import { ParseMap, SceneType } from "../type";
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
  skip: false,
  isLoadingOverlay: false,
  isYTStarted: false,
});

export const sceneAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("scene"));
const skipAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("skip"));
const isLoadingOverlayAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("isLoadingOverlay"));
const isYTStartedAtom = focusAtom(gameStateUtilParamsAtom, (optic) => optic.prop("isYTStarted"));

export const useReadGameUtilParams = () => {
  return useAtomCallback(
    useCallback((get) => get(gameStateUtilParamsAtom), []),
    { store }
  );
};

export const useSetGameUtilParams = () => useSetAtom(gameStateUtilParamsAtom, { store });

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const useSetScene = () => useSetAtom(sceneAtom, { store });

export const useIsLoadingOverlayState = () => useAtomValue(isLoadingOverlayAtom);
export const useSetIsLoadingOverlay = () => useSetAtom(isLoadingOverlayAtom);

export const useSkipState = () => useAtomValue(skipAtom, { store });
export const useSetSkip = () => useSetAtom(skipAtom, { store });

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

const nextLyricsAtom = atomWithReset("");

export const useNextLyricsState = () => useAtomValue(nextLyricsAtom, { store });
export const useSetNextLyrics = () => {
  const setNextLyrics = useSetAtom(nextLyricsAtom, { store });
  const resetNextLyrics = useCallback(() => store.set(nextLyricsAtom, RESET), []);

  return { setNextLyrics, resetNextLyrics };
};
