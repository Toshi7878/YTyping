import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { BuiltMapLine, InputMode } from "lyrics-typing-engine";
import type z from "zod/v4";
import type { RouterOutputs } from "@/server/api/trpc";
import { findClosestLowerOrEqual } from "@/utils/array";
import type { Updater } from "@/utils/types";
import type { LineOptionSchema } from "@/validator/raw-map-json";
import type { TypingLineResults } from "@/validator/result";
import type { SceneType, SkipGuideKey } from "../type";
import { setLineResultSelected } from "./family";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const builtMapAtom = atomWithReset<{
  lines: BuiltMapLine<z.infer<typeof LineOptionSchema>>[];
  totalNotes: { roma: number; kana: number };
  keyRate: number;
  missRate: number;
  initialLineResults: TypingLineResults;
  typingLineIndexes: number[];
  changeCSSIndexes: number[];
  duration: number;
  hasAlphabet: boolean;
  isCaseSensitive: boolean;
} | null>(null);
export const useBuiltMapState = () => useAtomValue(builtMapAtom, { store });
export const setBuiltMap = (map: ExtractAtomValue<typeof builtMapAtom>) => store.set(builtMapAtom, map);
export const resetBuiltMap = () => store.set(builtMapAtom, RESET);
export const readBuiltMap = () => store.get(builtMapAtom);

export const TAB_NAMES = ["ステータス", "ランキング"] as const;
const utilityParamsAtom = atomWithReset({
  scene: "ready" as SceneType,
  tabName: "ランキング" as (typeof TAB_NAMES)[number],
  inputMode: "roma" as InputMode,
  notify: Symbol(""),
  activeSkipKey: null as SkipGuideKey,
  changeCSSCount: null as number | null,
  isYTStarted: false,
  lineResultdrawerClosure: false,
  isPaused: false,
  movieDuration: 0,
  lineSelectIndex: 0,
  mediaSpeed: 1,
  minMediaSpeed: 1,
});

const lineResultDrawerClosureAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("lineResultdrawerClosure"));
const sceneAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("scene"));
const tabNameAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("tabName"));
const notifyAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("notify"));
const activeSkipKeyAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("activeSkipKey"));
const changeCSSCountAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("changeCSSCount"));
export const playingInputModeAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("inputMode"));
const isYTStartedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isYTStarted"));
const isPausedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isPaused"));
const movieDurationAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("movieDuration"));
const lineSelectIndexAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("lineSelectIndex"));
const mediaSpeedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("mediaSpeed"));
const minMediaSpeedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("minMediaSpeed"));

export const useLineResultSheetOpenState = () => useAtomValue(lineResultDrawerClosureAtom);
export const setLineResultSheet = (update: Updater<boolean>) => {
  store.set(lineResultDrawerClosureAtom, update);
};

const sceneGroupAtom = atom((get) => {
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

export const readUtilityParams = () => store.get(utilityParamsAtom);
export const resetUtilityParams = () => store.set(utilityParamsAtom, RESET);

export const useTabNameState = () => useAtomValue(tabNameAtom);
export const setTabName = (value: ExtractAtomValue<typeof tabNameAtom>) => store.set(tabNameAtom, value);

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const readScene = () => store.get(sceneAtom);
export const useSceneGroupState = () => useAtomValue(sceneGroupAtom, { store });
export const readSceneGroup = () => store.get(sceneGroupAtom);

export const setScene = (value: ExtractAtomValue<typeof sceneAtom>) => store.set(sceneAtom, value);

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const setPlayingInputMode = (value: ExtractAtomValue<typeof playingInputModeAtom>) =>
  store.set(playingInputModeAtom, value);

export const useActiveSkipGuideKeyState = () => useAtomValue(activeSkipKeyAtom, { store });
export const setActiveSkipGuideKey = (value: ExtractAtomValue<typeof activeSkipKeyAtom>) =>
  store.set(activeSkipKeyAtom, value);

export const useNotifyState = () => useAtomValue(notifyAtom, { store });
export const setNotify = (value: ExtractAtomValue<typeof notifyAtom>) => store.set(notifyAtom, value);

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store });
export const setChangeCSSCount = (currentIndex: number) => {
  const map = readBuiltMap();
  if (!map) return;
  if (map.changeCSSIndexes.length === 0) {
    store.set(changeCSSCountAtom, null);
    return;
  }

  store.set(changeCSSCountAtom, findClosestLowerOrEqual(map.changeCSSIndexes, currentIndex));
};

export const useIsPausedState = () => useAtomValue(isPausedAtom, { store });
export const setIsPaused = (value: ExtractAtomValue<typeof isPausedAtom>) => store.set(isPausedAtom, value);

export const useMovieDurationState = () => useAtomValue(movieDurationAtom, { store });
export const setMovieDuration = (value: ExtractAtomValue<typeof movieDurationAtom>) =>
  store.set(movieDurationAtom, value);

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom, { store });
export const setLineSelectIndex = (lineIndex: number) => {
  const map = readBuiltMap();
  if (!map) return;

  const count = map.typingLineIndexes[lineIndex - 1];
  if (count === undefined) return;

  const prevSelectedIndex = store.get(lineSelectIndexAtom);
  if (prevSelectedIndex !== null && prevSelectedIndex !== lineIndex) {
    const prevCount = map.typingLineIndexes[prevSelectedIndex - 1];
    if (prevCount !== undefined) {
      setLineResultSelected({ index: prevCount, isSelected: false });
    }
  }

  store.set(lineSelectIndexAtom, lineIndex);
  setLineResultSelected({ index: count, isSelected: true });
};

export const useMediaSpeedState = () => useAtomValue(mediaSpeedAtom, { store });
export const readMediaSpeed = () => store.get(mediaSpeedAtom);
export const setMediaSpeed = (nextSpeed: number) => store.set(mediaSpeedAtom, nextSpeed);

export const useMinMediaSpeedState = () => useAtomValue(minMediaSpeedAtom, { store });
export const readMinMediaSpeed = () => store.get(minMediaSpeedAtom);
export const setMinMediaSpeed = (nextSpeed: number) => store.set(minMediaSpeedAtom, nextSpeed);

export const useYTStartedState = () => useAtomValue(isYTStartedAtom);
export const setYTStarted = (value: ExtractAtomValue<typeof isYTStartedAtom>) => store.set(isYTStartedAtom, value);

const replayRankingResultAtom = atomWithReset<RouterOutputs["result"]["list"]["getRanking"][number] | null>(null);

export const useReplayRankingResultState = () => useAtomValue(replayRankingResultAtom);
export const readReplayRankingResult = () => store.get(replayRankingResultAtom);
export const setReplayRankingResult = (value: ExtractAtomValue<typeof replayRankingResultAtom>) =>
  store.set(replayRankingResultAtom, value);
export const resetReplayRankingResult = () => store.set(replayRankingResultAtom, RESET);
