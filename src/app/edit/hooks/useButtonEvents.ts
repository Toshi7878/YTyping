import {
  useEditUtilsStateRef,
  useLineReducer,
  useLineStateRef,
  useSetCanUploadState,
  useSetDirectEditIndexState,
  useSetIsUpdateUpdatedAtRef,
  useSetWordState,
  useYtPlayerStatusStateRef,
} from "../atoms/stateAtoms";

import { MapLine } from "@/types/map";
import { useSearchParams } from "next/navigation";
import { useHistoryReducer } from "../atoms/historyReducerAtom";
import { useMapReducer, useMapStateRef } from "../atoms/mapReducerAtom";
import { useEditUtilsRef, usePlayer, useTimeInput } from "../atoms/refAtoms";
import { useTimeOffsetStateRef } from "../atoms/storageAtoms";
import { useDeleteAddingTopPhrase, usePickupTopPhrase } from "./manyPhrase";
import { useChangeLineRowColor } from "./utils/useChangeLineRowColor";
import useTimeValidate from "./utils/useTimeValidate";
import { useUpdateNewMapBackUp } from "./utils/useUpdateNewMapBackUp";
import { useWordConverter } from "./utils/useWordConverter";

export const useLineAddButtonEvent = () => {
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const setDirectEdit = useSetDirectEditIndexState();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAtRef();

  const setCanUpload = useSetCanUploadState();
  const deleteAddingTopPhrase = useDeleteAddingTopPhrase();
  const pickupTopPhrase = usePickupTopPhrase();

  const readYtPlayerStatus = useYtPlayerStatusStateRef();
  const readSelectLine = useLineStateRef();
  const readTimeOffset = useTimeOffsetStateRef();
  const readEditUtils = useEditUtilsStateRef();
  const { readTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();
  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();
  const timeValidate = useTimeValidate();
  const { writeEditUtils } = useEditUtilsRef();

  return (isShiftKey: boolean) => {
    const { playing } = readYtPlayerStatus();
    const { lyrics, word } = readSelectLine();
    const timeOffset = word !== "" ? readTimeOffset() : 0;

    const _time = playing ? readPlayer().getCurrentTime() + timeOffset : Number(readTime());
    const time = timeValidate(_time).toFixed(3);
    const newLine: MapLine = !isShiftKey ? { time, lyrics, word } : { time, lyrics: "", word: "" };

    mapDispatch({ type: "add", payload: newLine });
    const lineIndex = readMap().findIndex((line) => JSON.stringify(line) === JSON.stringify(newLine));
    historyDispatch({ type: "add", payload: { actionType: "add", data: { ...newLine, lineIndex } } });

    if (newVideoId) {
      updateNewMapBackUp(newVideoId);
    }

    setCanUpload(true);
    setIsUpdateUpdatedAt(true);
    setDirectEdit(null);

    //フォーカスを外さないと追加ボタンクリック時にテーブルがスクロールされない
    (document.activeElement as HTMLElement)?.blur();
    writeEditUtils({
      tableScrollIndex: lineIndex,
    });

    if (isShiftKey) {
      return;
    }

    lineDispatch({ type: "reset" });
    const lyricsCopy = structuredClone(lyrics);
    deleteAddingTopPhrase(lyricsCopy);
    const { manyPhraseText } = readEditUtils();
    const topPhrase = manyPhraseText.split("\n")[0];
    pickupTopPhrase(topPhrase);
  };
};

export const useLineUpdateButtonEvent = () => {
  const setCanUpload = useSetCanUploadState();
  const setDirectEdit = useSetDirectEditIndexState();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAtRef();

  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();

  const readYtPlayerStatus = useYtPlayerStatusStateRef();
  const readSelectLine = useLineStateRef();
  const readTimeOffset = useTimeOffsetStateRef();
  const { readTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();
  const { writeEditUtils } = useEditUtilsRef();
  const readUtilsState = useEditUtilsStateRef();

  const timeValidate = useTimeValidate();
  return () => {
    const map = readMap();
    const { selectIndex: index, lyrics, word } = readSelectLine();
    const { playing } = readYtPlayerStatus();
    const { directEditingIndex } = readUtilsState();
    const timeOffset = word !== "" ? readTimeOffset() : 0;
    const selectLineIndex = index as number;

    const _time = playing && !directEditingIndex ? readPlayer()!.getCurrentTime() + timeOffset : +readTime();
    const formatedTime = timeValidate(_time).toFixed(3);

    const oldLine = map[selectLineIndex];
    const updatedLine = {
      time: formatedTime,
      lyrics,
      word,
      ...(oldLine.options && {
        options: oldLine.options,
      }),
    };

    historyDispatch({
      type: "add",
      payload: {
        actionType: "update",
        data: {
          old: oldLine,
          new: updatedLine,
          lineIndex: selectLineIndex,
        },
      },
    });

    if (oldLine.word !== word || oldLine.time !== formatedTime) {
      setIsUpdateUpdatedAt(true);
    }

    if (newVideoId) {
      updateNewMapBackUp(newVideoId);
    }

    writeEditUtils({
      tableScrollIndex: selectLineIndex + 1,
    });
    mapDispatch({ type: "update", payload: updatedLine, index: selectLineIndex });
    lineDispatch({ type: "reset" });
    setDirectEdit(null);
    setCanUpload(true);
  };
};

export const useWordConvertButtonEvent = () => {
  const wordConvert = useWordConverter();
  const readSelectLine = useLineStateRef();

  const setWord = useSetWordState();
  return async () => {
    const { lyrics } = readSelectLine();
    const word = await wordConvert(lyrics);
    setWord(word);
  };
};

export const useLineDelete = () => {
  const setCanUpload = useSetCanUploadState();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAtRef();
  const setDirectEdit = useSetDirectEditIndexState();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const { removeSelectedLineColor } = useChangeLineRowColor();
  const readSelectLine = useLineStateRef();
  const readMap = useMapStateRef();

  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();

  return () => {
    const { selectIndex } = readSelectLine();

    removeSelectedLineColor();
    setDirectEdit(null);
    lineDispatch({ type: "reset" });

    if (!selectIndex) {
      return;
    }

    const map = readMap();

    historyDispatch({
      type: "add",
      payload: { actionType: "delete", data: { ...map[selectIndex], lineIndex: selectIndex } },
    });

    mapDispatch({ type: "delete", index: selectIndex });
    setCanUpload(true);
    setIsUpdateUpdatedAt(true);

    if (newVideoId) {
      updateNewMapBackUp(newVideoId);
    }
  };
};
