import { useStore as useJotaiStore } from "jotai";
import { useDispatch, useStore as useReduxStore } from "react-redux";
import {
  useEditUtilsStateRef,
  useLineInputReducer,
  useSelectLineStateRef,
  useSetCanUploadState,
  useSetDirectEditIndexState,
  useSetIsMapDataEditedAtom,
  useYtPlayerStatusStateRef,
} from "../atoms/stateAtoms";

import { useSearchParams } from "next/navigation";
import { usePlayer, useTimeInput } from "../atoms/refAtoms";
import { useTimeOffsetStateRef } from "../atoms/storageAtoms";
import { setLastAddedTime, setMapData } from "../redux/mapDataSlice";
import { RootState } from "../redux/store";
import { addHistory } from "../redux/undoredoSlice";
import { useDeleteAddingTopPhrase, usePickupTopPhrase } from "./manyPhrase";
import { useChangeLineRowColor } from "./useChangeLineRowColor";
import { useGetSeekCount } from "./useGetSeekCount";
import { useUpdateNewMapBackUp } from "./useUpdateNewMapBackUp";
import { useWordConverter } from "./useWordConverter";

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
  const setDirectEdit = useSetDirectEditIndexState();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();

  const setCanUpload = useSetCanUploadState();
  const lineInputReducer = useLineInputReducer();
  const deleteAddingTopPhrase = useDeleteAddingTopPhrase();
  const pickupTopPhrase = usePickupTopPhrase();

  const readYtPlayerStatus = useYtPlayerStatusStateRef();
  const readSelectLine = useSelectLineStateRef();
  const readTimeOffset = useTimeOffsetStateRef();
  const readEditUtils = useEditUtilsStateRef();
  const { readTimeInput } = useTimeInput();
  const { readPlayer } = usePlayer();

  return (isShiftKey: boolean) => {
    const mapData = editReduxStore.getState().mapData.value;
    const { playing } = readYtPlayerStatus();
    const { lyrics, word } = readSelectLine();
    const timeOffset = readTimeOffset();

    const _time = playing ? readPlayer().getCurrentTime() + timeOffset : Number(readTimeInput().value);
    const time = timeValidate(_time).toFixed(3);
    const newLine = !isShiftKey ? { time, lyrics, word } : { time, lyrics: "", word: "" };

    const addLineMap = [...mapData, newLine].sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

    dispatch(setLastAddedTime(time));
    dispatch(setMapData(addLineMap));
    dispatch(addHistory({ type: "add", data: newLine }));

    if (newVideoId) {
      updateNewMapBackUp(newVideoId);
    }

    if (!isShiftKey) {
      lineInputReducer({ type: "reset" });

      const lyricsCopy = structuredClone(lyrics);
      deleteAddingTopPhrase(lyricsCopy);
      const { manyPhraseText } = readEditUtils();
      const topPhrase = manyPhraseText.split("\n")[0];
      pickupTopPhrase(topPhrase);
    }

    setCanUpload(true);
    setIsMapDataEdited(true);
    setDirectEdit(null);

    //フォーカスを外さないとクリック時にテーブルがスクロールされない
    (document.activeElement as HTMLElement)?.blur();
  };
};

export const useLineUpdateButtonEvent = () => {
  const editReduxStore = useReduxStore<RootState>();

  const setCanUpload = useSetCanUploadState();
  const dispatch = useDispatch();
  const lineInputReducer = useLineInputReducer();
  const setDirectEdit = useSetDirectEditIndexState();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();

  const readYtPlayerStatus = useYtPlayerStatusStateRef();
  const readSelectLine = useSelectLineStateRef();
  const readTimeOffset = useTimeOffsetStateRef();
  const { readTimeInput } = useTimeInput();
  const { readPlayer } = usePlayer();
  return () => {
    const mapData = editReduxStore.getState().mapData.value;
    const { index, lyrics, word } = readSelectLine();
    const { playing } = readYtPlayerStatus();
    const timeOffset = readTimeOffset();
    const selectLineIndex = index as number;

    const _time =
      playing && !selectLineIndex ? readPlayer()!.getCurrentTime() + timeOffset : +readTimeInput().value;

    const formatedTime = timeValidate(_time).toFixed(3);

    const oldLine = mapData[selectLineIndex];
    const updatedLine = {
      time: formatedTime,
      lyrics,
      word,
      ...(oldLine.options && {
        options: oldLine.options,
      }),
    };

    const newValue = [
      ...mapData.slice(0, selectLineIndex),
      updatedLine,
      ...mapData.slice(selectLineIndex + 1),
    ].sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

    setCanUpload(true);
    if (oldLine.word !== word || oldLine.time !== formatedTime) {
      setIsMapDataEdited(true);
    }
    dispatch(
      addHistory({
        type: "update",
        data: {
          old: mapData[selectLineIndex],
          new: { time: formatedTime, lyrics, word },
          lineNumber: selectLineIndex,
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
  const lineInputReducer = useLineInputReducer();
  const wordConvert = useWordConverter();
  const readSelectLine = useSelectLineStateRef();

  return async () => {
    const { lyrics } = readSelectLine();
    const word = await wordConvert(lyrics);
    lineInputReducer({ type: "set", payload: { word } });
  };
};

export const useLineDelete = () => {
  const editAtomStore = useJotaiStore();
  const editReduxStore = useReduxStore<RootState>();
  const setCanUpload = useSetCanUploadState();
  const dispatch = useDispatch();
  const lineInputReducer = useLineInputReducer();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();
  const setDirectEdit = useSetDirectEditIndexState();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const { allUpdateCurrentTimeColor } = useChangeLineRowColor();
  const getSeekCount = useGetSeekCount();
  const readSelectLine = useSelectLineStateRef();
  const { readPlayer } = usePlayer();

  return () => {
    const { index: selectLineIndex } = readSelectLine();

    if (selectLineIndex) {
      const mapData = editReduxStore.getState().mapData.value;

      const newValue = mapData.filter((_, index) => index !== selectLineIndex);

      dispatch(setMapData(newValue));
      setCanUpload(true);
      setIsMapDataEdited(true);
      dispatch(
        addHistory({
          type: "delete",
          data: {
            ...mapData[selectLineIndex],
            selectedLineCount: selectLineIndex,
          },
        })
      );

      if (newVideoId) {
        updateNewMapBackUp(newVideoId);
      }
    }
    const currentTime = readPlayer().getCurrentTime();

    allUpdateCurrentTimeColor(getSeekCount(currentTime));
    setDirectEdit(null);
    lineInputReducer({ type: "reset" });
  };
};
