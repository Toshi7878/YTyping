import {
  useLineReducer,
  useReadEditUtils,
  useReadLine,
  useReadYtPlayerStatus,
  useSetCanUpload,
  useSetDirectEditIndex,
  useSetIsUpdateUpdatedAt,
  useSetWord,
} from "../atoms/stateAtoms";

import { clientApi } from "@/trpc/client-api";
import { MapLine } from "@/types/map";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { normalizeSimilarSymbol } from "@/util/parse-map/normalizeSimilarSymbol";
import { useSearchParams } from "next/navigation";
import { useHistoryReducer } from "../atoms/historyReducerAtom";
import { useMapReducer, useMapStateRef } from "../atoms/mapReducerAtom";
import { useEditUtilsParams, usePlayer, useTimeInput } from "../atoms/refAtoms";
import { useReadTimeOffsetState } from "../atoms/storageAtoms";
import { useDeleteAddingTopPhrase, usePickupTopPhrase } from "./manyPhrase";
import useHasEditPermission from "./useUserEditPermission";
import { useChangeLineRowColor } from "./utils/useChangeLineRowColor";
import useTimeValidate from "./utils/useTimeValidate";
import { useUpdateNewMapBackUp } from "./utils/useUpdateNewMapBackUp";
import { useWordConverter } from "./utils/useWordConverter";

export const useLineAddButtonEvent = () => {
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const setDirectEdit = useSetDirectEditIndex();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAt();

  const setCanUpload = useSetCanUpload();
  const deleteAddingTopPhrase = useDeleteAddingTopPhrase();
  const pickupTopPhrase = usePickupTopPhrase();

  const readYtPlayerStatus = useReadYtPlayerStatus();
  const readSelectLine = useReadLine();
  const readTimeOffset = useReadTimeOffsetState();
  const readEditUtils = useReadEditUtils();
  const { readTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();
  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();
  const timeValidate = useTimeValidate();
  const { writeEditUtils } = useEditUtilsParams();

  return (isShiftKey: boolean) => {
    const { playing } = readYtPlayerStatus();
    const { lyrics, word } = readSelectLine();
    const timeOffset = word !== "" ? readTimeOffset() : 0;

    const _time = playing ? readPlayer().getCurrentTime() + timeOffset : Number(readTime());
    const time = timeValidate(_time).toFixed(3);
    const newLine: MapLine = !isShiftKey
      ? { time, lyrics: normalizeSimilarSymbol(lyrics), word: normalizeSimilarSymbol(word) }
      : { time, lyrics: "", word: "" };

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
  const setCanUpload = useSetCanUpload();
  const setDirectEdit = useSetDirectEditIndex();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAt();

  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();

  const readYtPlayerStatus = useReadYtPlayerStatus();
  const readSelectLine = useReadLine();
  const readTimeOffset = useReadTimeOffsetState();
  const { readTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();
  const readUtilsState = useReadEditUtils();
  const postFixWordLog = clientApi.morphConvert.post_fix_word_log.useMutation();

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
    const newLine = {
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
          new: newLine,
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

    mapDispatch({ type: "update", payload: newLine, index: selectLineIndex });
    lineDispatch({ type: "reset" });
    setDirectEdit(null);
    setCanUpload(true);

    if (newLine.time === oldLine.time && newLine.lyrics === oldLine.lyrics && newLine.word !== oldLine.word) {
      const hasKanji = /[\u4e00-\u9faf]/.test(oldLine.lyrics);

      if (hasKanji) {
        postFixWordLog.mutate({ lyrics: oldLine.lyrics, word: oldLine.word });
      }
    }
  };
};

export const useWordConvertButtonEvent = () => {
  const wordConvert = useWordConverter();
  const readSelectLine = useReadLine();
  const hasEditPermission = useHasEditPermission();
  const toast = useCustomToast();

  const setWord = useSetWord();
  return async () => {
    if (!hasEditPermission) {
      toast({
        type: "warning",
        title: "読み変換機能は編集保存権限が有効な場合に使用できます",
      });
      return;
    }

    const { lyrics } = readSelectLine();
    const word = await wordConvert(lyrics);
    setWord(word);
  };
};

export const useLineDelete = () => {
  const setCanUpload = useSetCanUpload();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAt();
  const setDirectEdit = useSetDirectEditIndex();

  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const { removeSelectedLineColor } = useChangeLineRowColor();
  const readSelectLine = useReadLine();
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
