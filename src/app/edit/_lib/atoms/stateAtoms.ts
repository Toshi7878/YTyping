import { Tag, YouTubeSpeed } from "@/types";
import { atom, ExtractAtomValue, useAtomValue, useSetAtom } from "jotai";
import { atomWithReducer, atomWithReset, RESET, useAtomCallback } from "jotai/utils";

import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import { TAB_NAMES } from "../const";
import { TagsReducerAction, YTSpeedReducerActionType } from "../type";
import { playerAtom, timeInputAtom } from "./refAtoms";
import { getEditAtomStore } from "./store";
const store = getEditAtomStore();

const editUtilsAtom = atomWithReset({
  tabName: "情報&保存" as (typeof TAB_NAMES)[number],
  geminiTags: [] as string[],
  timeCount: 0,
  directEditingIndex: null as number | null,
  manyPhraseText: "",
  cssTextLength: 0,
  isWordConverting: false,
  isLrcConverting: false,
  isTimeInputValid: true,
  isUpdateUpdatedAt: false,
  canUpload: false,
  openLineOptionDialogIndex: null as number | null,
  timeRangeValue: 0,
});
const tabNameAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("tabName"));
export const geminiTagsAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("geminiTags"));
const timeCountAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("timeCount"));
const directEditingIndexAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("directEditingIndex"));
const manyPhraseTextAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("manyPhraseText"));
const cssTextLengthAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("cssTextLength"));
const isWordConvertingAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("isWordConverting"));
const isLrcConvertingAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("isLrcConverting"));
export const isTimeInputValidAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("isTimeInputValid"));
const isUpdateUpdatedAtAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("isUpdateUpdatedAt"));
const canUploadAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("canUpload"));
const openLineOptionDialogIndexAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("openLineOptionDialogIndex"));
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

export const useGeminiTagsState = () => useAtomValue(geminiTagsAtom, { store });
export const useSetGeminiTags = () => useSetAtom(geminiTagsAtom, { store });

export const useTimeCountState = () => useAtomValue(timeCountAtom, { store });
export const useSetTimeCount = () => useSetAtom(timeCountAtom, { store });

export const useDirectEditIndexState = () => useAtomValue(directEditingIndexAtom, { store });
export const useSetDirectEditIndex = () => useSetAtom(directEditingIndexAtom, { store });

export const useManyPhraseState = () => useAtomValue(manyPhraseTextAtom, { store });
export const useSetManyPhrase = () => useSetAtom(manyPhraseTextAtom, { store });

export const useCssLengthState = () => useAtomValue(cssTextLengthAtom, { store });
export const useSetCssLength = () => useSetAtom(cssTextLengthAtom, { store });

export const useIsWordConvertingState = () => useAtomValue(isWordConvertingAtom, { store });
export const useSetIsWordConverting = () => useSetAtom(isWordConvertingAtom, { store });

export const useIsLrcConvertingState = () => useAtomValue(isLrcConvertingAtom, { store });
export const useSetIsLrcConverting = () => useSetAtom(isLrcConvertingAtom, { store });

export const useCanUploadState = () => useAtomValue(canUploadAtom, { store });
export const useSetCanUpload = () => useSetAtom(canUploadAtom, { store });

export const useSetIsTimeInputValid = () => useSetAtom(isTimeInputValidAtom, { store });
export const useSetIsUpdateUpdatedAt = () => useSetAtom(isUpdateUpdatedAtAtom, { store });

export const useOpenLineOptionDialogIndexState = () => useAtomValue(openLineOptionDialogIndexAtom, { store });
export const useSetOpenLineOptionDialogIndex = () => useSetAtom(openLineOptionDialogIndexAtom, { store });

export const useTimeRangeValueState = () => useAtomValue(timeRangeValueAtom, { store });
export const useSetTimeRangeValue = () => useSetAtom(timeRangeValueAtom, { store });

const ytPlayerStatusAtom = atomWithReset({
  videoId: "",
  readied: false,
  started: false,
  playing: false,
  speed: 1 as YouTubeSpeed,
  duration: 0,
});

export const videoIdAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("videoId"));
const readiedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("readied"));
const startedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("started"));
const playingAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("playing"));
const ytDurationAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("duration"));
const speedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("speed"));

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
export const useSetIsYTReadied = () => useSetAtom(readiedAtom, { store });

export const useIsYTStartedState = () => useAtomValue(startedAtom, { store });
export const useSetIsYTStarted = () => useSetAtom(startedAtom, { store });

export const useSetIsYTPlaying = () => useSetAtom(playingAtom, { store });

export const useVideoIdState = () => useAtomValue(videoIdAtom, { store });
export const useSetVideoId = () => useSetAtom(videoIdAtom, { store });

export const useYTDurationState = () => useAtomValue(ytDurationAtom, { store });
export const useSetYTDuration = () => useSetAtom(ytDurationAtom, { store });

store.sub(speedAtom, () => {
  const player = store.get(playerAtom);
  const speed = store.get(speedAtom);

  if (player) {
    player.setPlaybackRate(speed);
  }
});

export const useSpeedReducer = () => {
  const setYTSpeedAtom = useSetYTSpeed();
  return (actionType: YTSpeedReducerActionType) => {
    const speed = store.get(speedAtom);

    switch (actionType) {
      case "up":
        {
          const newSpeed = (speed < 2 ? speed + 0.25 : 2) as YouTubeSpeed;
          setYTSpeedAtom(newSpeed);
        }
        break;
      case "down":
        {
          const newSpeed = (speed > 0.25 ? speed - 0.25 : 0.25) as YouTubeSpeed;
          setYTSpeedAtom(newSpeed);
        }
        break;
    }
  };
};

export const mapInfoAtom = atomWithReset({
  title: "",
  artist: "",
  comment: "",
  source: "",
  previewTime: "",
  creatorId: null as number | null,
});

const mapTitleAtom = focusAtom(mapInfoAtom, (optic) => optic.prop("title"));
const mapArtistAtom = focusAtom(mapInfoAtom, (optic) => optic.prop("artist"));
const mapCommentAtom = focusAtom(mapInfoAtom, (optic) => optic.prop("comment"));
const mapSourceAtom = focusAtom(mapInfoAtom, (optic) => optic.prop("source"));
const mapPreviewTimeAtom = focusAtom(mapInfoAtom, (optic) => optic.prop("previewTime"));
const mapCreatorIdAtom = focusAtom(mapInfoAtom, (optic) => optic.prop("creatorId"));
export const mapTagsAtom = atomWithReducer<Tag[], TagsReducerAction>([], tagsReducer);

interface WriteVideoInfoAtomParams {
  title: ExtractAtomValue<typeof mapTitleAtom>;
  artistName: ExtractAtomValue<typeof mapArtistAtom>;
  source: ExtractAtomValue<typeof mapSourceAtom>;
}
const writeVideoInfoAtom = atom(null, (get, set, newVideoInfo: WriteVideoInfoAtomParams) => {
  const { title, artistName, source } = newVideoInfo;

  set(mapTitleAtom, title);
  set(mapArtistAtom, artistName);
  set(mapSourceAtom, source);
});

export const useSetMapInfo = () => useSetAtom(writeVideoInfoAtom, { store });
export const useReadMapInfo = () => {
  return useAtomCallback(
    useCallback((get) => get(mapInfoAtom), []),
    { store },
  );
};

export const useMapTitleState = () => useAtomValue(mapTitleAtom, { store });
export const useSetMapTitle = () => useSetAtom(mapTitleAtom, { store });

export const useMapArtistState = () => useAtomValue(mapArtistAtom, { store });
export const useSetMapArtist = () => useSetAtom(mapArtistAtom, { store });

export const useMapPreviewTimeState = () => useAtomValue(mapPreviewTimeAtom, { store });
export const useSetPreviewTime = () => useSetAtom(mapPreviewTimeAtom, { store });

export const useMapCreatorIdState = () => useAtomValue(mapCreatorIdAtom, { store });

export const useMapCommentState = () => useAtomValue(mapCommentAtom, { store });
export const useSetMapComment = () => useSetAtom(mapCommentAtom, { store });

export const useMapSourceState = () => useAtomValue(mapSourceAtom, { store });
export const useSetMapSource = () => useSetAtom(mapSourceAtom, { store });

function tagsReducer(state: Tag[], action: TagsReducerAction): Tag[] {
  switch (action.type) {
    case "set":
      const tags = action.payload as Tag[];
      return tags;
    case "add":
      if (action.payload && !Array.isArray(action.payload)) {
        return [...state, action.payload];
      }
    case "delete":
      if (!Array.isArray(action.payload)) {
        const deleteTag = action.payload as Tag; // 追加
        return state.filter((tag) => tag.id !== deleteTag.id);
      }
    case "reset":
      return [];
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
export const useMapTagsState = () => useAtomValue(mapTagsAtom, { store });
export const useSetMapTags = () => useSetAtom(mapTagsAtom, { store });
export const useReadMapTags = () => {
  return useAtomCallback(
    useCallback((get) => get(mapTagsAtom), []),
    { store },
  );
};

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
export const useSetSelectIndex = () => useSetAtom(selectLineIndexAtom, { store });
