import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomWithReset, RESET, selectAtom } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { readTimeInputValue, setTimeInputValue } from "./ref";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

export const TAB_NAMES = ["情報&保存", "エディター", "ショートカットキー&設定"] as const;
const utilityParamsAtom = atomWithReset({
  tabName: "情報&保存" as (typeof TAB_NAMES)[number],
  playingLineIndex: 0,
  directEditingIndex: null as number | null,
  manyPhraseText: "",
  cssTextLength: 0,
  isWordConverting: false,
  isTimeInputValid: true,
  isUpdateUpdatedAt: false,
  canUpload: false,
  timeRangeValue: 0,
});
const tabNameAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("tabName"));
const playingLineIndexAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("playingLineIndex"));
const directEditingIndexAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("directEditingIndex"));
const manyPhraseTextAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("manyPhraseText"));
const cssTextLengthAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("cssTextLength"));
const isWordConvertingAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isWordConverting"));
export const isTimeInputValidAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isTimeInputValid"));
const isUpdateUpdatedAtAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isUpdateUpdatedAt"));
const canUploadAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("canUpload"));
const timeRangeValueAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("timeRangeValue"));

export const readUtilityParams = () => store.get(utilityParamsAtom);
export const resetUtilityParams = () => store.set(utilityParamsAtom, RESET);

export const useTabNameState = () => useAtomValue(tabNameAtom, { store });
export const setTabName = (value: ExtractAtomValue<typeof tabNameAtom>) => store.set(tabNameAtom, value);
export const useIsPlayingLineState = (index: number) => {
  return useAtomValue(
    selectAtom(playingLineIndexAtom, (s) => s === index),
    { store },
  );
};
export const setPlayingLineIndex = (value: ExtractAtomValue<typeof playingLineIndexAtom>) =>
  store.set(playingLineIndexAtom, value);

export const useIsDirectEditLine = (index: number) => {
  return useAtomValue(
    selectAtom(directEditingIndexAtom, (s) => s === index),
    { store },
  );
};
export const readDirectEditIndex = () => store.get(directEditingIndexAtom);
export const setDirectEditIndex = (value: ExtractAtomValue<typeof directEditingIndexAtom>) =>
  store.set(directEditingIndexAtom, value);

export const useManyPhraseState = () => useAtomValue(manyPhraseTextAtom, { store });
export const setManyPhrase = (value: ExtractAtomValue<typeof manyPhraseTextAtom>) =>
  store.set(manyPhraseTextAtom, value);

export const useCssLengthState = () => useAtomValue(cssTextLengthAtom, { store });
export const setCssLength = (value: ExtractAtomValue<typeof cssTextLengthAtom>) => store.set(cssTextLengthAtom, value);

export const useIsWordConvertingState = () => useAtomValue(isWordConvertingAtom, { store });
export const setIsWordConverting = (value: ExtractAtomValue<typeof isWordConvertingAtom>) =>
  store.set(isWordConvertingAtom, value);

export const useCanUploadState = () => useAtomValue(canUploadAtom, { store });
export const setCanUpload = (value: ExtractAtomValue<typeof canUploadAtom>) => store.set(canUploadAtom, value);

export const setIsTimeInputValid = (value: ExtractAtomValue<typeof isTimeInputValidAtom>) =>
  store.set(isTimeInputValidAtom, value);
export const setIsUpdateUpdatedAt = (value: ExtractAtomValue<typeof isUpdateUpdatedAtAtom>) =>
  store.set(isUpdateUpdatedAtAtom, value);

export const useTimeRangeValueState = () => useAtomValue(timeRangeValueAtom, { store });
export const setTimeRangeValue = (value: ExtractAtomValue<typeof timeRangeValueAtom>) =>
  store.set(timeRangeValueAtom, value);

const YTPlayerStatusAtom = atomWithReset({
  isReadied: false,
  isStarted: false,
  isPlaying: false,
  isChangingVideo: false,
  mediaSpeed: 1,
  duration: 0,
});

const isReadiedAtom = focusAtom(YTPlayerStatusAtom, (optic) => optic.prop("isReadied"));
const isStartedAtom = focusAtom(YTPlayerStatusAtom, (optic) => optic.prop("isStarted"));
const isPlayingAtom = focusAtom(YTPlayerStatusAtom, (optic) => optic.prop("isPlaying"));
const isChangingVideoAtom = focusAtom(YTPlayerStatusAtom, (optic) => optic.prop("isChangingVideo"));
const ytDurationAtom = focusAtom(YTPlayerStatusAtom, (optic) => optic.prop("duration"));
const mediaSpeedAtom = focusAtom(YTPlayerStatusAtom, (optic) => optic.prop("mediaSpeed"));

export const resetYTPlayerStatus = () => store.set(YTPlayerStatusAtom, RESET);
export const readYTPlayerStatus = () => store.get(YTPlayerStatusAtom);

export const useMediaSpeedState = () => useAtomValue(mediaSpeedAtom, { store });
export const setMediaSpeed = (value: ExtractAtomValue<typeof mediaSpeedAtom>) => store.set(mediaSpeedAtom, value);

export const setIsYTReadied = (value: ExtractAtomValue<typeof isReadiedAtom>) => store.set(isReadiedAtom, value);

export const setIsYTStarted = (value: ExtractAtomValue<typeof isStartedAtom>) => store.set(isStartedAtom, value);
export const setIsYTPlaying = (value: ExtractAtomValue<typeof isPlayingAtom>) => store.set(isPlayingAtom, value);

export const useYTDurationState = () => useAtomValue(ytDurationAtom, { store });
export const setYTDuration = (value: ExtractAtomValue<typeof ytDurationAtom>) => store.set(ytDurationAtom, value);

export const setYTChangingVideo = (value: ExtractAtomValue<typeof isChangingVideoAtom>) =>
  store.set(isChangingVideoAtom, value);

const lineAtom = atomWithReset({
  selectIndex: null as number | null,
  lyrics: "",
  word: "",
});

interface WriteLineSetAction {
  type: "set";
  line: ExtractAtomValue<typeof lineAtom> & { time: string | number };
}

interface ResetLineAction {
  type: "reset";
}

const writeLineAtom = atom(null, (_, set, action: WriteLineSetAction | ResetLineAction) => {
  if (action.type === "set" && "line" in action) {
    const { time, ...lineAtomData } = action.line;
    set(lineAtom, lineAtomData);
    setTimeInputValue(String(time));
  } else if (action.type === "reset") {
    set(lineAtom, RESET);
    setTimeInputValue("");
  }
});

store.sub(lineAtom, () => {
  const timeInputValue = readTimeInputValue();
  store.set(isTimeInputValidAtom, timeInputValue === "");
});

const selectLineLyricsAtom = focusAtom(lineAtom, (optic) => optic.prop("lyrics"));
const selectLineWordAtom = focusAtom(lineAtom, (optic) => optic.prop("word"));
export const selectLineIndexAtom = focusAtom(lineAtom, (optic) => optic.prop("selectIndex"));

export const useSelectIndexState = () => useAtomValue(selectLineIndexAtom, { store });
export const useIsSelectedLine = (index: number) => {
  const isSelectedAtom = selectAtom(selectLineIndexAtom, (s) => s === index);
  return useAtomValue(isSelectedAtom, { store });
};

export const dispatchLine = (action: WriteLineSetAction | ResetLineAction) => store.set(writeLineAtom, action);
export const readSelectLine = () => store.get(lineAtom);

export const useLyricsState = () => useAtomValue(selectLineLyricsAtom, { store });
export const setLyrics = (value: ExtractAtomValue<typeof selectLineLyricsAtom>) =>
  store.set(selectLineLyricsAtom, value);

export const useWordState = () => useAtomValue(selectLineWordAtom, { store });
export const setWord = (value: ExtractAtomValue<typeof selectLineWordAtom>) => store.set(selectLineWordAtom, value);
