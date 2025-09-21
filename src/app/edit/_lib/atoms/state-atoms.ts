import type { ExtractAtomValue} from "jotai";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";

import type { YouTubeSpeed } from "@/types/global-types";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import type { TAB_NAMES } from "../const";
import { playerAtom, timeInputAtom } from "./read-atoms";
import { getEditAtomStore } from "./store";
const store = getEditAtomStore();

const editUtilsAtom = atomWithReset({
  tabName: "情報&保存" as (typeof TAB_NAMES)[number],
  timeLineIndex: 0,
  directEditingIndex: null as number | null,
  manyPhraseText: "",
  cssTextLength: 0,
  isWordConverting: false,
  isTimeInputValid: true,
  isUpdateUpdatedAt: false,
  canUpload: false,
  timeRangeValue: 0,
});
const tabNameAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("tabName"));
const timeLineIndexAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("timeLineIndex"));
const directEditingIndexAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("directEditingIndex"));
const manyPhraseTextAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("manyPhraseText"));
const cssTextLengthAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("cssTextLength"));
const isWordConvertingAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("isWordConverting"));
export const isTimeInputValidAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("isTimeInputValid"));
const isUpdateUpdatedAtAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("isUpdateUpdatedAt"));
const canUploadAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("canUpload"));
const timeRangeValueAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("timeRangeValue"));

export const useSetEditUtils = () => useSetAtom(editUtilsAtom, { store });
export const useReadEditUtils = () => {
  return useAtomCallback(
    useCallback((get) => get(editUtilsAtom), []),
    { store },
  );
};

export const useTabNameState = () => useAtomValue(tabNameAtom, { store });
export const useSetTabName = () => useSetAtom(tabNameAtom, { store });

export const useTimeLineIndexState = () => useAtomValue(timeLineIndexAtom, { store });
export const useSetTimeLineIndex = () => useSetAtom(timeLineIndexAtom, { store });

export const useDirectEditIndexState = () => useAtomValue(directEditingIndexAtom, { store });
export const useSetDirectEditIndex = () => useSetAtom(directEditingIndexAtom, { store });

export const useManyPhraseState = () => useAtomValue(manyPhraseTextAtom, { store });
export const useSetManyPhrase = () => useSetAtom(manyPhraseTextAtom, { store });

export const useCssLengthState = () => useAtomValue(cssTextLengthAtom, { store });
export const useSetCssLength = () => useSetAtom(cssTextLengthAtom, { store });

export const useIsWordConvertingState = () => useAtomValue(isWordConvertingAtom, { store });
export const useSetIsWordConverting = () => useSetAtom(isWordConvertingAtom, { store });

export const useCanUploadState = () => useAtomValue(canUploadAtom, { store });
export const useSetCanUpload = () => useSetAtom(canUploadAtom, { store });

export const useSetIsTimeInputValid = () => useSetAtom(isTimeInputValidAtom, { store });
export const useSetIsUpdateUpdatedAt = () => useSetAtom(isUpdateUpdatedAtAtom, { store });

export const useTimeRangeValueState = () => useAtomValue(timeRangeValueAtom, { store });
export const useSetTimeRangeValue = () => useSetAtom(timeRangeValueAtom, { store });

const ytPlayerStatusAtom = atomWithReset({
  videoId: null as string | null,
  readied: false,
  started: false,
  playing: false,
  speed: 1 as YouTubeSpeed,
  duration: 0,
  changingVideo: false,
});

const videoIdAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("videoId"));
const readiedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("readied"));
const startedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("started"));
const playingAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("playing"));
const ytDurationAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("duration"));
const speedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("speed"));
const changingVideoAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("changingVideo"));

export const useSetYtPlayerStatus = () => useSetAtom(ytPlayerStatusAtom, { store });
export const useReadYtPlayerStatus = () => {
  return useAtomCallback(
    useCallback((get) => get(ytPlayerStatusAtom), []),
    { store },
  );
};
export const useYTSpeedState = () => useAtomValue(speedAtom, { store });
export const useSetYTSpeed = () => useSetAtom(speedAtom, { store });

export const useIsYTReadiedState = () => useAtomValue(readiedAtom, { store });

export const useIsYTStartedState = () => useAtomValue(startedAtom, { store });
export const useSetIsYTStarted = () => useSetAtom(startedAtom, { store });

export const useSetIsYTPlaying = () => useSetAtom(playingAtom, { store });

export const useVideoIdState = () => useAtomValue(videoIdAtom, { store });
export const useSetVideoId = () => useSetAtom(videoIdAtom, { store });

export const useYTDurationState = () => useAtomValue(ytDurationAtom, { store });
export const useSetYTChaningVideo = () => useSetAtom(changingVideoAtom, { store });

store.sub(speedAtom, () => {
  const player = store.get(playerAtom);
  const speed = store.get(speedAtom);

  if (player) {
    player.setPlaybackRate(speed);
  }
});

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

const writeLineAtom = atom(null, (get, set, action: WriteLineSetAction | ResetLineAction) => {
  const timeInput = get(timeInputAtom) as HTMLInputElement;

  if (action.type === "set" && "line" in action) {
    const { time, ...lineAtomData } = action.line;
    set(lineAtom, lineAtomData);
    timeInput.value = String(time);
  } else if (action.type === "reset") {
    set(lineAtom, RESET);
    timeInput.value = "";
  }
});

store.sub(lineAtom, () => {
  const timeInput = store.get(timeInputAtom) as HTMLInputElement;

  store.set(isTimeInputValidAtom, timeInput.value === "");
});

const selectLineLyricsAtom = focusAtom(lineAtom, (optic) => optic.prop("lyrics"));
const selectLineWordAtom = focusAtom(lineAtom, (optic) => optic.prop("word"));
export const selectLineIndexAtom = focusAtom(lineAtom, (optic) => optic.prop("selectIndex"));

export const useLineReducer = () => useSetAtom(writeLineAtom, { store });
export const useReadLine = () => {
  return useAtomCallback(
    useCallback((get) => get(lineAtom), []),
    { store },
  );
};

export const useLyricsState = () => useAtomValue(selectLineLyricsAtom, { store });
export const useSetLyrics = () => useSetAtom(selectLineLyricsAtom, { store });

export const useWordState = () => useAtomValue(selectLineWordAtom, { store });
export const useSetWord = () => useSetAtom(selectLineWordAtom, { store });

export const useSelectIndexState = () => useAtomValue(selectLineIndexAtom, { store });
