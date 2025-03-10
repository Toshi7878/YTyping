import { useStore as useJotaiStore } from "jotai";
import { useDispatch, useStore as useReduxStore } from "react-redux";
import {
  editAddTimeOffsetAtom,
  editLineLyricsAtom,
  editLineSelectedCountAtom,
  editLineWordAtom,
  isEditYouTubePlayingAtom,
  useLineInputReducer,
  useSetCanUploadAtom,
  useSetEditDirectEditCountAtom,
  useSetIsMapDataEditedAtom,
} from "../edit-atom/editAtom";

import { useSearchParams } from "next/navigation";
import { useRefs } from "../edit-contexts/refsProvider";
import { setLastAddedTime, setMapData } from "../redux/mapDataSlice";
import { RootState } from "../redux/store";
import { addHistory } from "../redux/undoredoSlice";
import { useChangeLineRowColor } from "./useChangeLineRowColor";
import { useDeleteTopLyricsText } from "./useEditManyLyricsTextHooks";
import { useGetSeekCount } from "./useGetSeekCount";
import { useUpdateNewMapBackUp } from "./useUpdateNewMapBackUp";
import { useWordConvert } from "./useWordConvert";

const timeValidate = (time: number) => {
  if (0 >= time) {
    return 0.001;
  } else {
    return time;
  }
};

export const useLineAddButtonEvent = () => {
  const editAtomStore = useJotaiStore();
  const editReduxStore = useReduxStore<RootState>();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const dispatch = useDispatch();
  const setDirectEdit = useSetEditDirectEditCountAtom();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();

  const { timeInputRef, playerRef } = useRefs();
  const setCanUpload = useSetCanUploadAtom();
  const lineInputReducer = useLineInputReducer();
  const deleteTopLyricsText = useDeleteTopLyricsText();

  return (isShiftKey: boolean) => {
    const mapData = editReduxStore.getState().mapData.value;
    const isYTPlaying = editAtomStore.get(isEditYouTubePlayingAtom);
    const addTimeOffset = editAtomStore.get(editAddTimeOffsetAtom);

    const lyrics = editAtomStore.get(editLineLyricsAtom);
    const word = editAtomStore.get(editLineWordAtom);
    const timeOffset = isYTPlaying && word && !isShiftKey ? Number(addTimeOffset) : 0;
    const time_ = Number(
      isYTPlaying ? playerRef.current!.getCurrentTime() : timeInputRef.current!.value
    );
    const time = timeValidate(time_ + timeOffset).toFixed(3);
    const newLine = !isShiftKey ? { time, lyrics, word } : { time, lyrics: "", word: "" };
    const addLineMap = [...mapData, newLine].sort(
      (a, b) => parseFloat(a.time) - parseFloat(b.time)
    );

    dispatch(setLastAddedTime(time));
    dispatch(setMapData(addLineMap));
    dispatch(addHistory({ type: "add", data: newLine }));

    if (newVideoId) {
      updateNewMapBackUp(newVideoId);
    }

    if (!isShiftKey) {
      lineInputReducer({ type: "reset" });

      const lyricsCopy = structuredClone(lyrics);
      deleteTopLyricsText(lyricsCopy);
    }

    setCanUpload(true);
    setIsMapDataEdited(true);
    setDirectEdit(null);

    //フォーカスを外さないとクリック時にテーブルがスクロールされない
    (document.activeElement as HTMLElement)?.blur();
  };
};

export const useLineUpdateButtonEvent = () => {
  const editAtomStore = useJotaiStore();
  const editReduxStore = useReduxStore<RootState>();

  const { timeInputRef, playerRef } = useRefs();
  const setCanUpload = useSetCanUploadAtom();
  const dispatch = useDispatch();
  const lineInputReducer = useLineInputReducer();
  const setDirectEdit = useSetEditDirectEditCountAtom();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const editJotaiStore = useJotaiStore();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();

  return () => {
    const mapData = editReduxStore.getState().mapData.value;

    const endAfterLineIndex =
      mapData.length -
      1 -
      mapData
        .slice()
        .reverse()
        .findIndex((line) => line.lyrics === "end");

    const selectedLineCount = editAtomStore.get(editLineSelectedCountAtom) as number;
    const isYTPlaying = editJotaiStore.get(isEditYouTubePlayingAtom);
    const addTimeOffset = editJotaiStore.get(editAddTimeOffsetAtom);
    const lyrics = editAtomStore.get(editLineLyricsAtom);
    const word = editAtomStore.get(editLineWordAtom);
    const timeOffset = isYTPlaying && word && !selectedLineCount ? Number(addTimeOffset) : 0;
    const time_ = Number(
      isYTPlaying && !selectedLineCount
        ? playerRef.current!.getCurrentTime()
        : timeInputRef.current!.value
    );

    const time = timeValidate(time_ + timeOffset).toFixed(3);

    const oldLine = mapData[selectedLineCount];
    const updatedLine = {
      time,
      lyrics,
      word,
      ...(oldLine.options && {
        options: oldLine.options,
      }),
    };

    const newValue = [
      ...mapData.slice(0, selectedLineCount),
      updatedLine,
      ...mapData.slice(selectedLineCount + 1),
    ].sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

    setCanUpload(true);
    if (oldLine.word !== word || oldLine.time !== time) {
      setIsMapDataEdited(true);
    }
    dispatch(
      addHistory({
        type: "update",
        data: {
          old: mapData[selectedLineCount!],
          new: { time, lyrics, word },
          lineNumber: selectedLineCount,
        },
      })
    );

    dispatch(setMapData(newValue));

    if (newVideoId) {
      updateNewMapBackUp(newVideoId);
    }

    lineInputReducer({ type: "reset" });
    setDirectEdit(null);
  };
};

export const useWordConvertButtonEvent = () => {
  const editAtomStore = useJotaiStore();

  const lineInputReducer = useLineInputReducer();
  const wordConvert = useWordConvert();

  return async () => {
    const lyrics = editAtomStore.get(editLineLyricsAtom);
    const word = await wordConvert(lyrics);
    lineInputReducer({ type: "set", payload: { word } });
  };
};

export const useLineDelete = () => {
  const editAtomStore = useJotaiStore();
  const editReduxStore = useReduxStore<RootState>();
  const setCanUpload = useSetCanUploadAtom();
  const dispatch = useDispatch();
  const lineInputReducer = useLineInputReducer();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();
  const setDirectEdit = useSetEditDirectEditCountAtom();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const { allUpdateCurrentTimeColor } = useChangeLineRowColor();
  const { playerRef } = useRefs();
  const getSeekCount = useGetSeekCount();

  return () => {
    const selectedLineCount = editAtomStore.get(editLineSelectedCountAtom);

    if (selectedLineCount) {
      const mapData = editReduxStore.getState().mapData.value;

      const newValue = mapData.filter((_, index) => index !== selectedLineCount);

      dispatch(setMapData(newValue));
      setCanUpload(true);
      setIsMapDataEdited(true);
      dispatch(
        addHistory({
          type: "delete",
          data: {
            ...mapData[selectedLineCount],
            selectedLineCount: selectedLineCount,
          },
        })
      );

      if (newVideoId) {
        updateNewMapBackUp(newVideoId);
      }
    }
    const currentTime = playerRef.current!.getCurrentTime();

    allUpdateCurrentTimeColor(getSeekCount(currentTime));
    setDirectEdit(null);
    lineInputReducer({ type: "reset" });
  };
};
