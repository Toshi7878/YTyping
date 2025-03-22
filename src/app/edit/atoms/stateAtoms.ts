import { Tag, YouTubeSpeed } from "@/types";
import { atom, ExtractAtomValue, useAtomValue, useStore as useJotaiStore, useSetAtom } from "jotai";
import { atomWithReducer, atomWithReset, RESET, useAtomCallback } from "jotai/utils";

import { playerRefAtom } from "@/app/type/atoms/refAtoms";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import { TabIndex, TagsReducerAction, YTSpeedReducerActionType } from "../ts/type";
import { timeInputRef } from "./refAtoms";
import { getEditAtomStore } from "./store";
const store = getEditAtomStore();

const editUtilsAtom = atomWithReset({
  tabIndex: 0 as TabIndex,
  geminiTags: [] as string[],
  timeCount: 0,
  directEditingIndex: null as number | null,
  manyPhraseText: "",
  cssTextLength: 0,
  isWordConverting: false,
  isLrcConverting: false,
  isTimeInputValid: false,
  isUpdateUpdatedAt: false,
  canUpload: false,
});
const tabIndexAtom = focusAtom(editUtilsAtom, (optic) => optic.prop("tabIndex"));
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

export const useSetEditUtilsState = () => useSetAtom(editUtilsAtom, { store });
export const useEditUtilsStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(editUtilsAtom), []),
    { store }
  );
};

export const useTabIndexState = () => useAtomValue(tabIndexAtom, { store });
export const useSetTabIndexState = () => useSetAtom(tabIndexAtom, { store });

export const useGeminiTagsState = () => useAtomValue(geminiTagsAtom, { store });
export const useSetGeminiTagsState = () => useSetAtom(geminiTagsAtom, { store });

export const useTimeCountState = () => useAtomValue(timeCountAtom, { store });
export const useSetTimeCountState = () => useSetAtom(timeCountAtom, { store });

export const useDirectEditIndexState = () => useAtomValue(directEditingIndexAtom, { store });
export const useSetDirectEditIndexState = () => useSetAtom(directEditingIndexAtom, { store });

export const useManyPhraseState = () => useAtomValue(manyPhraseTextAtom, { store });
export const useSetManyPhraseState = () => useSetAtom(manyPhraseTextAtom, { store });

export const useCssLengthState = () => useAtomValue(cssTextLengthAtom, { store });
export const useSetCssLengthState = () => useSetAtom(cssTextLengthAtom, { store });

export const useIsWordConvertingState = () => useAtomValue(isWordConvertingAtom, { store });
export const useSetIsWordConvertingState = () => useSetAtom(isWordConvertingAtom, { store });

export const useIsLrcConvertingState = () => useAtomValue(isLrcConvertingAtom, { store });
export const useSetIsLrcConvertingState = () => useSetAtom(isLrcConvertingAtom, { store });

export const useCanUploadState = () => useAtomValue(canUploadAtom, { store });
export const useSetCanUploadState = () => useSetAtom(canUploadAtom, { store });

export const useSetIsTimeInputValidState = () => useSetAtom(isTimeInputValidAtom, { store });
export const useSetIsUpdateUpdatedAtRef = () => useSetAtom(isUpdateUpdatedAtAtom, { store });

const ytPlayerStatusAtom = atomWithReset({
  videoId: "",
  readied: false,
  started: false,
  playing: false,
  speed: 1 as YouTubeSpeed,
});
export const videoIdAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("videoId"));
const readiedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("readied"));
const startedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("started"));
const playingAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("playing"));
const speedAtom = focusAtom(ytPlayerStatusAtom, (optic) => optic.prop("speed"));

export const useSetYtPlayerStatusState = () => useSetAtom(ytPlayerStatusAtom, { store });
export const useYtPlayerStatusStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(ytPlayerStatusAtom), []),
    { store }
  );
};
export const useYTSpeedState = () => useAtomValue(speedAtom, { store });
export const useSetYTSpeedState = () => useSetAtom(speedAtom, { store });

export const useIsYTReadiedState = () => useAtomValue(readiedAtom, { store });
export const useSetIsYTReadiedState = () => useSetAtom(readiedAtom, { store });

export const useIsYTStartedState = () => useAtomValue(startedAtom, { store });
export const useSetIsYTStartedState = () => useSetAtom(startedAtom, { store });

export const useIsYTPlayingState = () => useAtomValue(playingAtom, { store });
export const useSetIsYTPlayingState = () => useSetAtom(playingAtom, { store });

export const useVideoIdState = () => useAtomValue(videoIdAtom, { store });
export const useSetVideoIdState = () => useSetAtom(videoIdAtom, { store });

store.sub(speedAtom, () => {
  const player = store.get(playerRefAtom);
  const speed = store.get(speedAtom);

  if (player) {
    player.setPlaybackRate(speed);
  }
});

export const useSpeedReducer = () => {
  const editAtomStore = useJotaiStore();
  const setYTSpeedAtom = useSetYTSpeedState();
  return (actionType: YTSpeedReducerActionType) => {
    const speed = editAtomStore.get(speedAtom);

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

export const useSetMapInfoState = () => useSetAtom(mapInfoAtom, { store });
export const useMapInfoStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(mapInfoAtom), []),
    { store }
  );
};

export const useMapTitleState = () => useAtomValue(mapTitleAtom, { store });
export const useSetMapTitleState = () => useSetAtom(mapTitleAtom, { store });

export const useMapArtistState = () => useAtomValue(mapArtistAtom, { store });
export const useSetMapArtistState = () => useSetAtom(mapArtistAtom, { store });

export const useMapPreviewTimeState = () => useAtomValue(mapPreviewTimeAtom, { store });
export const useSetPreviewTimeState = () => useSetAtom(mapPreviewTimeAtom, { store });

export const useMapCreatorIdState = () => useAtomValue(mapCreatorIdAtom, { store });
export const useSetMapCreatorIdState = () => useSetAtom(mapCreatorIdAtom, { store });

export const useMapCommentState = () => useAtomValue(mapCommentAtom, { store });
export const useSetMapCommentState = () => useSetAtom(mapCommentAtom, { store });

export const useMapSourceState = () => useAtomValue(mapSourceAtom, { store });
export const useSetMapSourceState = () => useSetAtom(mapSourceAtom, { store });

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
export const useSetMapTagsState = () => useSetAtom(mapTagsAtom, { store });
export const useMapTagsStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(mapTagsAtom), []),
    { store }
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
  const timeInput = get(timeInputRef) as HTMLInputElement;

  if (action.type === "set" && "line" in action) {
    const { time, ...lineAtomData } = action.line;
    set(lineAtom, lineAtomData);
    timeInput.value = String(time);
  } else if (action.type === "reset") {
    set(lineAtom, RESET);
    timeInput.value = "";
  }
});
const selectLineLyricsAtom = focusAtom(lineAtom, (optic) => optic.prop("lyrics"));
const selectLineWordAtom = focusAtom(lineAtom, (optic) => optic.prop("word"));
export const selectLineIndexAtom = focusAtom(lineAtom, (optic) => optic.prop("selectIndex"));

export const useLineReducer = () => useSetAtom(writeLineAtom, { store });
export const useLineStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(lineAtom), []),
    { store }
  );
};

export const useLyricsState = () => useAtomValue(selectLineLyricsAtom, { store });
export const useSetLyricsState = () => useSetAtom(selectLineLyricsAtom, { store });

export const useWordState = () => useAtomValue(selectLineWordAtom, { store });
export const useSetWordState = () => useSetAtom(selectLineWordAtom, { store });

export const useSelectIndexState = () => useAtomValue(selectLineIndexAtom, { store });
export const useSetSelectIndexState = () => useSetAtom(selectLineIndexAtom, { store });
