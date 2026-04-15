import type { ExtractAtomValue } from "jotai";
import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { BuiltMapLine, InputMode } from "lyrics-typing-engine";
import type z from "zod/v4";
import type { RouterOutputs } from "@/server/api/trpc";
import type { LineOptionSchema } from "@/validator/map/raw-map-json";
import type { TypingLineResult } from "@/validator/result";
import { setLineResultSelected } from "./line-result";
import { getTypingGameAtomStore } from "./store";

const store = getTypingGameAtomStore();

const builtMapAtom = atomWithReset<{
  lines: BuiltMapLine<z.infer<typeof LineOptionSchema>>[];
  totalNotes: { roma: number; kana: number };
  keyRate: number;
  missRate: number;
  initialLineResults: TypingLineResult[];
  typingLineIndexes: number[];
  changeCSSIndexes: number[];
  duration: number;
  hasAlphabet: boolean;
  isCaseSensitive: boolean;
} | null>(null);
export type BuiltMap = ExtractAtomValue<typeof builtMapAtom>;
export const useBuiltMapState = () => useAtomValue(builtMapAtom, { store });
export const setBuiltMap = (map: BuiltMap) => store.set(builtMapAtom, map);
export const resetBuiltMap = () => store.set(builtMapAtom, RESET);
//TODO: builitMapがnullの場合にエラーハンドリング
export const getBuiltMap = () => store.get(builtMapAtom);
export const setLastLineEndTime = (map: NonNullable<BuiltMap>, endTime: number) => {
  const lines = map.lines.map((line, i) => (i === map.lines.length - 1 ? { ...line, time: endTime } : line));
  store.set(builtMapAtom, { ...map, lines, duration: Math.min(map.duration, endTime) });
};

const utilityParamsAtom = atomWithReset({
  inputMode: "roma" as InputMode,
  notify: Symbol(""),
  isYTStarted: false,
  isPaused: false,
  lineSelectIndex: 0,
  mediaSpeed: 1,
  minMediaSpeed: 1,
});

const notifyAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("notify"));
export const playingInputModeAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("inputMode"));
const isYTStartedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isYTStarted"));
const isPausedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isPaused"));
const lineSelectIndexAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("lineSelectIndex"));
const mediaSpeedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("mediaSpeed"));
const minMediaSpeedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("minMediaSpeed"));

export const readUtilityParams = () => store.get(utilityParamsAtom);
export const resetUtilityParams = () => store.set(utilityParamsAtom, RESET);

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const getPlayingInputMode = () => store.get(playingInputModeAtom);
export const setPlayingInputMode = (value: ExtractAtomValue<typeof playingInputModeAtom>) =>
  store.set(playingInputModeAtom, value);

export const useNotifyState = () => useAtomValue(notifyAtom, { store });
export const setNotify = (value: ExtractAtomValue<typeof notifyAtom>) => store.set(notifyAtom, value);

export const useIsPausedState = () => useAtomValue(isPausedAtom, { store });
export const setIsPaused = (value: ExtractAtomValue<typeof isPausedAtom>) => store.set(isPausedAtom, value);

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom, { store });
export const setLineSelectIndex = (lineIndex: number) => {
  const map = getBuiltMap();
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
