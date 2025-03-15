import { Tag, YouTubeSpeed } from "@/types";
import { atom, createStore, useAtomValue, useStore as useJotaiStore, useSetAtom } from "jotai";
import { atomWithReducer } from "jotai/utils";
import { useStore as useReduxStore } from "react-redux";
import { useRefs } from "../edit-contexts/refsProvider";
import { RootState } from "../redux/store";

import { DEFAULT_ADD_ADJUST_TIME } from "../ts/const/editDefaultValues";
import {
  ConvertOptionsType,
  EditTabIndex,
  LineInputReducerAction,
  TagsReducerAction,
  YTSpeedReducerActionType,
} from "../ts/type";

const editAtomStore = createStore();
export const getEditAtomStore = () => editAtomStore;

const editTabIndexAtom = atom<EditTabIndex>(0);
export const useTabIndexAtom = () => useAtomValue(editTabIndexAtom, { store: editAtomStore });
export const useSetTabIndexAtom = () => useSetAtom(editTabIndexAtom, { store: editAtomStore });

export const editMapTitleAtom = atom<string>("");
export const useMapTitleAtom = () => useAtomValue(editMapTitleAtom, { store: editAtomStore });
export const useSetMapTitleAtom = () => useSetAtom(editMapTitleAtom, { store: editAtomStore });

export const editMapArtistNameAtom = atom<string>("");
export const useMapArtistNameAtom = () => useAtomValue(editMapArtistNameAtom, { store: editAtomStore });
export const useSetMapArtistNameAtom = () => useSetAtom(editMapArtistNameAtom, { store: editAtomStore });

export const editVideoIdAtom = atom<string>("");
export const useVideoIdAtom = () => useAtomValue(editVideoIdAtom, { store: editAtomStore });
export const useSetVideoIdAtom = () => useSetAtom(editVideoIdAtom, { store: editAtomStore });

export const editCreatorCommentAtom = atom<string>("");
export const useCreatorCommentAtom = () =>
  useAtomValue(editCreatorCommentAtom, { store: editAtomStore });
export const useSetCreatorCommentAtom = () =>
  useSetAtom(editCreatorCommentAtom, { store: editAtomStore });

export const editMusicSourceAtom = atom<string>("");
export const useEditMusicSourceAtom = () => useAtomValue(editMusicSourceAtom, { store: editAtomStore });
export const useSetEditMusicSourceAtom = () => useSetAtom(editMusicSourceAtom, { store: editAtomStore });

export const editGeminiTagsAtom = atom<string[]>([]);
export const useGeminiTagsAtom = () => useAtomValue(editGeminiTagsAtom, { store: editAtomStore });
export const useSetGeminiTagsAtom = () => useSetAtom(editGeminiTagsAtom, { store: editAtomStore });

const tagsReducer = (state: Tag[], action: TagsReducerAction): Tag[] => {
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
};

export const editTagsAtom = atomWithReducer<Tag[], TagsReducerAction>([], tagsReducer);

export const useTagsAtom = () => useAtomValue(editTagsAtom, { store: editAtomStore });
export const useSetTagsAtom = () => useSetAtom(editTagsAtom, { store: editAtomStore });

export const editCreatorIdAtom = atom<number | null>(null);
export const useCreatorIdAtom = () => useAtomValue(editCreatorIdAtom, { store: editAtomStore });
export const useSetCreatorIdAtom = () => useSetAtom(editCreatorIdAtom, { store: editAtomStore });

export const editSpeedAtom = atom<YouTubeSpeed>(1);
export const useEditYTSpeedAtom = () => useAtomValue(editSpeedAtom, { store: editAtomStore });
const useSetEditYTSpeedAtom = () => useSetAtom(editSpeedAtom, { store: editAtomStore });

export const useSpeedReducer = () => {
  const editAtomStore = useJotaiStore();
  const setYTSpeedAtom = useSetEditYTSpeedAtom();
  const { playerRef } = useRefs();

  return (actionType: YTSpeedReducerActionType) => {
    const speed = editAtomStore.get(editSpeedAtom);

    switch (actionType) {
      case "up":
        {
          const newSpeed = (speed < 2 ? speed + 0.25 : 2) as YouTubeSpeed;
          setYTSpeedAtom(newSpeed);
          playerRef.current!.setPlaybackRate(newSpeed);
        }
        break;
      case "down":
        {
          const newSpeed = (speed > 0.25 ? speed - 0.25 : 0.25) as YouTubeSpeed;
          setYTSpeedAtom(newSpeed);
          playerRef.current!.setPlaybackRate(newSpeed);
        }
        break;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  };
};

export const useSpeedAtom = () => useAtomValue(editSpeedAtom, { store: editAtomStore });
export const useSetSpeedAtom = () => useSetAtom(editSpeedAtom, { store: editAtomStore });

const isEditYouTubeReadyAtom = atom<boolean>(false);
export const useIsEditYTReadyAtom = () => useAtomValue(isEditYouTubeReadyAtom, { store: editAtomStore });
export const useSetIsEditYTReadyAtom = () =>
  useSetAtom(isEditYouTubeReadyAtom, { store: editAtomStore });

const isEditYouTubeStartedAtom = atom<boolean>(false);
export const useIsEditYTStartedAtom = () =>
  useAtomValue(isEditYouTubeStartedAtom, { store: editAtomStore });
export const useSetIsEditYTStartedAtom = () =>
  useSetAtom(isEditYouTubeStartedAtom, { store: editAtomStore });

export const isEditYouTubePlayingAtom = atom<boolean>(false);
export const useIsEditYTPlayingAtom = () =>
  useAtomValue(isEditYouTubePlayingAtom, { store: editAtomStore });
export const useSetIsEditYTPlayingAtom = () =>
  useSetAtom(isEditYouTubePlayingAtom, { store: editAtomStore });

export const editLineLyricsAtom = atom<string>("");
export const editLineWordAtom = atom<string>("");
export const editLineSelectedCountAtom = atom<number | null>(null);

const isLineNotSelectAtom = atom<boolean>((get) => {
  const count = get(editLineSelectedCountAtom);
  return count === 0 || count === null;
});

export const useIsLineNotSelectAtom = () => useAtomValue(isLineNotSelectAtom, { store: editAtomStore });

const isLineLastSelectAtom = atom((get) => {
  const mapData = get(editReduxStoreAtom).getState().mapData.value;
  const selectedLineCount = get(editLineSelectedCountAtom);
  const endAfterLineIndex =
    mapData.length -
    1 -
    mapData
      .slice()
      .reverse()
      .findIndex((line) => line.lyrics === "end");

  if (selectedLineCount === null) {
    return false;
  }

  return selectedLineCount === endAfterLineIndex;
});

export const useIsLineLastSelectAtom = () =>
  useAtomValue(isLineLastSelectAtom, { store: editAtomStore });

export const useEditLineLyricsAtom = () => useAtomValue(editLineLyricsAtom, { store: editAtomStore });

export const useEditLineWordAtom = () => useAtomValue(editLineWordAtom, { store: editAtomStore });

export const useEditLineSelectedCountAtom = () =>
  useAtomValue(editLineSelectedCountAtom, { store: editAtomStore });

export const useSetEditLineLyricsAtom = () => useSetAtom(editLineLyricsAtom, { store: editAtomStore });

export const useSetEditLineWordAtom = () => useSetAtom(editLineWordAtom, { store: editAtomStore });

export const useSetEditLineSelectedCountAtom = () =>
  useSetAtom(editLineSelectedCountAtom, { store: editAtomStore });

export const useLineInputReducer = () => {
  const setEditLineLyrics = useSetEditLineLyricsAtom();
  const setEditLineWord = useSetEditLineWordAtom();
  const { timeInputRef } = useRefs();
  const setEditLineCount = useSetEditLineSelectedCountAtom();
  const setEditIsTimeInputValid = useSetEditIsTimeInputValidAtom();
  const editReduxStore = useReduxStore<RootState>();
  const editJotaiStore = useJotaiStore();

  return ({ type, payload }: LineInputReducerAction) => {
    switch (type) {
      case "set":
        if (payload) {
          setEditLineWord(payload.word);
          if (typeof payload.lyrics === "string") {
            setEditLineLyrics(payload.lyrics);
          }
          if (typeof payload.selectCount === "number") {
            const mapData = editReduxStore.getState().mapData.value;
            timeInputRef.current!.value = mapData[payload.selectCount].time;
            setEditIsTimeInputValid(false);
            setEditLineCount(payload.selectCount);
          } else if (typeof payload.time === "string") {
            timeInputRef.current!.value = payload.time;
            setEditIsTimeInputValid(false);
          }
        }
        break;
      case "reset":
        const isYTPlaying = editJotaiStore.get(isEditYouTubePlayingAtom);

        if (!isYTPlaying) {
          timeInputRef.current!.value = "";
          setEditIsTimeInputValid(true);
        }
        setEditLineLyrics("");
        setEditLineCount(null);
        setEditLineWord("");
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  };
};

export const editTimeCountAtom = atom<number>(0);
export const useEditTimeCountAtom = () => useAtomValue(editTimeCountAtom, { store: editAtomStore });
export const useSetEditTimeCountAtom = () => useSetAtom(editTimeCountAtom, { store: editAtomStore });

export const manyPhraseAtom = atom<string>("");
export const useManyPhraseAtom = () => useAtomValue(manyPhraseAtom, { store: editAtomStore });
export const useSetManyPhraseAtom = () => useSetAtom(manyPhraseAtom, { store: editAtomStore });

const editIsLoadWordConvertingAtom = atom<boolean>(false);
export const useIsLoadWordConvertingAtom = () =>
  useAtomValue(editIsLoadWordConvertingAtom, { store: editAtomStore });

export const useSetIsLoadWordConvertingAtom = () =>
  useSetAtom(editIsLoadWordConvertingAtom, { store: editAtomStore });

const editIsLrcConvertingAtom = atom<boolean>(false);
export const useIsLrcConvertingAtom = () =>
  useAtomValue(editIsLrcConvertingAtom, { store: editAtomStore });
export const useSetIsLrcConvertingAtom = () =>
  useSetAtom(editIsLrcConvertingAtom, { store: editAtomStore });

const editCanUploadAtom = atom<boolean>(false);
export const useCanUploadAtom = () => useAtomValue(editCanUploadAtom, { store: editAtomStore });
export const useSetCanUploadAtom = () => useSetAtom(editCanUploadAtom, { store: editAtomStore });

export const editAddTimeOffsetAtom = atom<number>(DEFAULT_ADD_ADJUST_TIME);
export const useEditAddTimeOffsetAtom = () =>
  useAtomValue(editAddTimeOffsetAtom, { store: editAtomStore });
export const useSetEditAddTimeOffsetAtom = () =>
  useSetAtom(editAddTimeOffsetAtom, { store: editAtomStore });

export const editWordConvertOptionAtom = atom<ConvertOptionsType>("non_symbol");
export const useEditWordConvertOptionAtom = () =>
  useAtomValue(editWordConvertOptionAtom, { store: editAtomStore });
export const useSetEditWordConvertOptionAtom = () =>
  useSetAtom(editWordConvertOptionAtom, { store: editAtomStore });

const editIsTimeInputValidAtom = atom<boolean>(false);

export const useSetEditIsTimeInputValidAtom = () =>
  useSetAtom(editIsTimeInputValidAtom, { store: editAtomStore });

export const isAddButtonDisabledAtom = atom((get) => {
  const isTimeInputValid = get(editIsTimeInputValidAtom);
  return isTimeInputValid;
});

// 新しい派生atomを使用するフックを作成
export const useIsAddButtonDisabled = () => {
  return useAtomValue(isAddButtonDisabledAtom, { store: editAtomStore });
};

export const isDeleteButtonDisabledAtom = atom((get) => {
  const isLineNotSelect = get(isLineNotSelectAtom);
  const isLineLastSelect = get(isLineLastSelectAtom);

  return isLineNotSelect || isLineLastSelect;
});

export const useIsDeleteButtonDisabledAtom = () =>
  useAtomValue(isDeleteButtonDisabledAtom, { store: editAtomStore });

export const isUpdateButtonDisabledAtom = atom((get) => {
  const isTimeInputValid = get(editIsTimeInputValidAtom);
  const isLineNotSelect = get(isLineNotSelectAtom);
  const isLineLastSelect = get(isLineLastSelectAtom);

  return isTimeInputValid || isLineNotSelect || isLineLastSelect;
});

export const useIsUpdateButtonDisabledAtom = () =>
  useAtomValue(isUpdateButtonDisabledAtom, { store: editAtomStore });

export const editPreviewTimeInputAtom = atom<string>("");

export const useEditPreviewTimeInputAtom = () =>
  useAtomValue(editPreviewTimeInputAtom, { store: editAtomStore });

export const useSetEditPreviewTimeInputAtom = () =>
  useSetAtom(editPreviewTimeInputAtom, { store: editAtomStore });

const editCustomStyleLengthAtom = atom<number>(0);

export const useEditCustomStyleLengthAtom = () =>
  useAtomValue(editCustomStyleLengthAtom, { store: editAtomStore });

export const useSetEditCustomStyleLengthAtom = () =>
  useSetAtom(editCustomStyleLengthAtom, { store: editAtomStore });

export const editDirectEditCountAtom = atom<number | null>(null);

export const useEditDirectEditCountAtom = () =>
  useAtomValue(editDirectEditCountAtom, { store: editAtomStore });
export const useSetEditDirectEditCountAtom = () =>
  useSetAtom(editDirectEditCountAtom, { store: editAtomStore });

const editReduxStoreAtom = atom(() => useReduxStore<RootState>());

export const isMapDataEditedAtom = atom<boolean>(false);

export const useSetIsMapDataEditedAtom = () => useSetAtom(isMapDataEditedAtom, { store: editAtomStore });
