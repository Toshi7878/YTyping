import {
  useLineReducer,
  useReadEditUtils,
  useReadLine,
  useReadYtPlayerStatus,
  useSetCanUpload,
  useSetDirectEditIndex,
  useSetIsUpdateUpdatedAt,
  useSetWord,
} from "../atoms/state-atoms";

import { backupMap } from "@/lib/indexed-db";
import type { MapLine } from "@/types/map";
import { normalizeSimilarSymbol } from "@/utils/build-map/normalizeSimilarSymbol";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useHistoryReducer } from "../atoms/history-reducer-atom";
import { useMapReducer, useReadMap } from "../atoms/map-reducer-atom";
import { usePlayer, useTimeInput } from "../atoms/read-atoms";
import { useReadTimeOffsetState } from "../atoms/storage-atoms";
import { useDeleteTopPhrase, usePickupTopPhrase } from "./many-phrase";
import { mapTableScroll } from "./map-table-scroll";
import useHasMapUploadPermission from "./use-has-map-upload-permission";
import useTimeValidate from "./use-time-validate";
import { useWordConverter } from "./use-word-converter";

export const useLineAddButtonEvent = () => {
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const setDirectEdit = useSetDirectEditIndex();
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAt();

  const setCanUpload = useSetCanUpload();
  const pickupTopPhrase = usePickupTopPhrase();
  const deleteTopPhrase = useDeleteTopPhrase();

  const readYtPlayerStatus = useReadYtPlayerStatus();
  const readSelectLine = useReadLine();
  const readTimeOffset = useReadTimeOffsetState();
  const readEditUtils = useReadEditUtils();
  const { readTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();
  const timeValidate = useTimeValidate();
  const readMap = useReadMap();

  return (isShiftKey: boolean) => {
    const { playing } = readYtPlayerStatus();
    const { lyrics, word } = readSelectLine();
    const timeOffset = word !== "" ? readTimeOffset() : 0;

    const _time = playing ? readPlayer().getCurrentTime() + timeOffset : Number(readTime());
    const time = timeValidate(_time).toFixed(3);
    const newLine: MapLine = !isShiftKey
      ? { time, lyrics, word: normalizeSimilarSymbol(word) }
      : { time, lyrics: "", word: "" };

    mapDispatch({ type: "add", payload: newLine });
    const lineIndex = readMap().findIndex((line) => JSON.stringify(line) === JSON.stringify(newLine));
    historyDispatch({ type: "add", payload: { actionType: "add", data: { ...newLine, lineIndex } } });

    if (newVideoId) {
      const map = readMap();
      backupMap({ videoId: newVideoId, map });
    }

    setCanUpload(true);
    setIsUpdateUpdatedAt(true);
    setDirectEdit(null);

    //フォーカスを外さないと追加ボタンクリック時にテーブルがスクロールされない
    (document.activeElement as HTMLElement)?.blur();

    setTimeout(() => mapTableScroll({ rowIndex: lineIndex }));

    if (isShiftKey) return;

    lineDispatch({ type: "reset" });
    const lyricsCopy = structuredClone(lyrics);
    deleteTopPhrase(lyricsCopy);
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
  const setIsUpdateUpdatedAt = useSetIsUpdateUpdatedAt();

  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();

  const readYtPlayerStatus = useReadYtPlayerStatus();
  const readSelectLine = useReadLine();
  const readTimeOffset = useReadTimeOffsetState();
  const { readTime } = useTimeInput();
  const { readPlayer } = usePlayer();
  const readUtilsState = useReadEditUtils();

  // const trpc = useTRPC();
  // 読み修正編集履歴ログを送信するmutation
  // const postFixWordLog = useMutation(trpc.morphConvert.post_fix_word_log.mutationOptions());

  const timeValidate = useTimeValidate();

  const readMap = useReadMap();
  return () => {
    const map = readMap();
    const { selectIndex: index, lyrics, word } = readSelectLine();
    const { playing } = readYtPlayerStatus();
    const { directEditingIndex } = readUtilsState();
    const timeOffset = word !== "" ? readTimeOffset() : 0;
    const selectLineIndex = index as number;

    const _time = playing && !directEditingIndex ? readPlayer().getCurrentTime() + timeOffset : +readTime();
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
      const map = readMap();
      backupMap({ videoId: newVideoId, map });
    }

    mapDispatch({ type: "update", payload: newLine, index: selectLineIndex });
    lineDispatch({ type: "reset" });
    setDirectEdit(null);
    setCanUpload(true);

    if (newLine.time === oldLine.time && newLine.lyrics === oldLine.lyrics && newLine.word !== oldLine.word) {
      const hasKanji = /[\u4e00-\u9faf]/.test(oldLine.lyrics);
      if (!hasKanji) return;

      // postFixWordLog.mutate({ lyrics: oldLine.lyrics, word: oldLine.word });
    }
  };
};

export const useWordConvertButtonEvent = () => {
  const wordConvert = useWordConverter();
  const readSelectLine = useReadLine();
  const hasEditPermission = useHasMapUploadPermission();

  const setWord = useSetWord();
  return async () => {
    if (!hasEditPermission) {
      toast.warning("読み変換機能は編集保存権限が有効な場合に使用できます");
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
  const readSelectLine = useReadLine();

  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const lineDispatch = useLineReducer();

  const readMap = useReadMap();

  return () => {
    const { selectIndex } = readSelectLine();

    setDirectEdit(null);
    lineDispatch({ type: "reset" });
    if (!selectIndex) return;

    const map = readMap();

    historyDispatch({
      type: "add",
      payload: { actionType: "delete", data: { ...map[selectIndex], lineIndex: selectIndex } },
    });

    mapDispatch({ type: "delete", index: selectIndex });
    setCanUpload(true);
    setIsUpdateUpdatedAt(true);

    if (newVideoId) {
      const map = readMap();
      backupMap({ videoId: newVideoId, map });
    }
  };
};
