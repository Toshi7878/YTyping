import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { backupMap } from "@/lib/indexed-db";
import type { MapLine } from "@/server/drizzle/validator/map-json";
import { normalizeSymbols } from "@/utils/string-transform";
import { dispatchEditHistory } from "../atoms/history-reducer";
import { mapAction, readMap } from "../atoms/map-reducer";
import { readTimeInputValue, readYTPlayer } from "../atoms/ref";
import {
  dispatchLine,
  readSelectLine,
  readUtilityParams,
  readYTPlayerStatus,
  setCanUpload,
  setDirectEditIndex,
  setIsUpdateUpdatedAt,
  setWord,
} from "../atoms/state";
import { readTimeOffset } from "../atoms/storage";
import { scrollMapTable } from "../map-table/scroll-map-table";
import { useHasMapUploadPermission } from "../map-table/use-has-map-upload-permission";
import { deleteTopPhrase, pickupTopPhrase } from "./many-phrase";
import { timeValidate } from "./time-validate";
import { wordConvert } from "./typable-word-convert";

export const useAddLineAction = () => {
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";

  return (isShiftKey: boolean) => {
    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;
    const { playing } = readYTPlayerStatus();
    const { lyrics, word } = readSelectLine();
    const timeOffset = word !== "" ? readTimeOffset() : 0;

    const _time = playing ? YTPlayer.getCurrentTime() + timeOffset : Number(readTimeInputValue());
    const time = timeValidate(_time).toFixed(3);
    const newLine: MapLine = !isShiftKey
      ? { time, lyrics, word: normalizeSymbols(word) }
      : { time, lyrics: "", word: "" };

    mapAction({ type: "add", payload: newLine });
    const lineIndex = readMap().findIndex((line) => JSON.stringify(line) === JSON.stringify(newLine));
    dispatchEditHistory({ type: "add", payload: { actionType: "add", data: { ...newLine, lineIndex } } });

    if (newVideoId) {
      const map = readMap();
      void backupMap({ videoId: newVideoId, map });
    }

    setCanUpload(true);
    setIsUpdateUpdatedAt(true);
    setDirectEditIndex(null);

    //フォーカスを外さないと追加ボタンクリック時にテーブルがスクロールされない
    (document.activeElement as HTMLElement)?.blur();

    setTimeout(() => scrollMapTable({ rowIndex: lineIndex }));

    if (isShiftKey) return;

    dispatchLine({ type: "reset" });
    const lyricsCopy = structuredClone(lyrics);
    deleteTopPhrase(lyricsCopy);
    const { manyPhraseText } = readUtilityParams();
    const topPhrase = manyPhraseText.split("\n")[0] ?? "";
    void pickupTopPhrase(topPhrase);
  };
};

export const useUpdateLineAction = () => {
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";

  // const trpc = useTRPC();
  // 読み修正編集履歴ログを送信するmutation
  // const postFixWordLog = useMutation(trpc.morphConvert.post_fix_word_log.mutationOptions());

  return () => {
    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;

    const map = readMap();
    const { selectIndex: index, lyrics, word } = readSelectLine();
    const { playing } = readYTPlayerStatus();
    const { directEditingIndex } = readUtilityParams();
    const timeOffset = word !== "" ? readTimeOffset() : 0;
    const selectLineIndex = index as number;

    const _time =
      playing && !directEditingIndex ? YTPlayer.getCurrentTime() + timeOffset : Number(readTimeInputValue());
    const formatedTime = timeValidate(_time).toFixed(3);

    const oldLine = map[selectLineIndex];
    if (!oldLine) return;

    const newLine = {
      time: formatedTime,
      lyrics,
      word,
      ...(oldLine.options && {
        options: oldLine.options,
      }),
    };

    dispatchEditHistory({
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
      void backupMap({ videoId: newVideoId, map });
    }

    mapAction({ type: "update", payload: newLine, index: selectLineIndex });
    dispatchLine({ type: "reset" });
    setDirectEditIndex(null);
    setCanUpload(true);

    // if (newLine.time === oldLine.time && newLine.lyrics === oldLine.lyrics && newLine.word !== oldLine.word) {
    //   const hasKanji = /[\u4e00-\u9faf]/.test(oldLine.lyrics);
    // if (!hasKanji) return;

    // postFixWordLog.mutate({ lyrics: oldLine.lyrics, word: oldLine.word });
    // }
  };
};

export const useWordConvertAction = () => {
  const hasEditPermission = useHasMapUploadPermission();

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

export const useDeleteLineAction = () => {
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";

  return () => {
    const { selectIndex } = readSelectLine();

    setDirectEditIndex(null);
    dispatchLine({ type: "reset" });
    if (!selectIndex) return;

    const map = readMap();
    const lineToDelete = map[selectIndex];
    if (!lineToDelete) return;

    dispatchEditHistory({
      type: "add",
      payload: { actionType: "delete", data: { ...lineToDelete, lineIndex: selectIndex } },
    });

    mapAction({ type: "delete", index: selectIndex });
    setCanUpload(true);
    setIsUpdateUpdatedAt(true);

    if (newVideoId) {
      const map = readMap();
      void backupMap({ videoId: newVideoId, map });
    }
  };
};
