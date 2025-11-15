import { toast } from "sonner";
import { backupMap } from "@/lib/indexed-db";
import { normalizeSymbols } from "@/utils/string-transform";
import type { MapLine } from "@/validator/map-json";
import { dispatchEditHistory } from "../atoms/history-reducer";
import { readMapId, readVideoId } from "../atoms/hydrate";
import { readMap, setMapAction } from "../atoms/map-reducer";
import { readTimeInputValue } from "../atoms/ref";
import {
  dispatchLine,
  getYTCurrentTime,
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
import { deleteTopPhrase, pickupTopPhrase } from "./many-phrase";
import { timeValidate } from "./time-validate";
import { wordConvert } from "./typable-word-convert";

export const addLineAction = (isShiftKey: boolean) => {
  const { isPlaying } = readYTPlayerStatus();
  const { lyrics, word } = readSelectLine();
  const timeOffset = lyrics !== "" ? readTimeOffset() : 0;

  const time = timeValidate(isPlaying ? (getYTCurrentTime() ?? 0) + timeOffset : Number(readTimeInputValue())).toFixed(
    3,
  );

  const newLine: MapLine = !isShiftKey
    ? { time, lyrics, word: normalizeSymbols(word) }
    : { time, lyrics: "", word: "" };

  setMapAction({ type: "add", payload: newLine });
  const lineIndex = readMap().findIndex((line) => JSON.stringify(line) === JSON.stringify(newLine));
  dispatchEditHistory({ type: "add", payload: { actionType: "add", data: { ...newLine, lineIndex } } });

  const mapId = readMapId();
  if (mapId === null) {
    const map = readMap();
    const videoId = readVideoId();
    void backupMap({ videoId, map });
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

export const updateLineAction = () => {
  const map = readMap();
  const { selectIndex: selectLineIndex, lyrics, word } = readSelectLine();
  if (selectLineIndex === null) return;
  const { isPlaying } = readYTPlayerStatus();
  const { directEditingIndex } = readUtilityParams();
  const timeOffset = lyrics !== "" ? readTimeOffset() : 0;

  const time = timeValidate(
    isPlaying && !directEditingIndex ? (getYTCurrentTime() ?? 0) + timeOffset : Number(readTimeInputValue()),
  ).toFixed(3);
  const oldLine = map[selectLineIndex];
  if (!oldLine) return;

  const newLine = {
    time,
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

  if (oldLine.word !== word || oldLine.time !== time) {
    setIsUpdateUpdatedAt(true);
  }

  const mapId = readMapId();
  if (mapId === null) {
    const map = readMap();
    const videoId = readVideoId();
    void backupMap({ videoId, map });
  }

  setMapAction({ type: "update", payload: newLine, index: selectLineIndex });
  dispatchLine({ type: "reset" });
  setDirectEditIndex(null);
  setCanUpload(true);

  // if (newLine.time === oldLine.time && newLine.lyrics === oldLine.lyrics && newLine.word !== oldLine.word) {
  //   const hasKanji = /[\u4e00-\u9faf]/.test(oldLine.lyrics);
  // if (!hasKanji) return;

  // postFixWordLog.mutate({ lyrics: oldLine.lyrics, word: oldLine.word });
  // }
};

export const wordConvertAction = async (hasUploadPermission: boolean) => {
  if (!hasUploadPermission) {
    toast.warning("読み変換機能は編集保存権限が有効な場合に使用できます");
    return;
  }

  const { lyrics } = readSelectLine();
  const word = await wordConvert(lyrics);
  setWord(word);
};

export const deleteLineAction = () => {
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

  setMapAction({ type: "delete", index: selectIndex });
  setCanUpload(true);
  setIsUpdateUpdatedAt(true);

  const mapId = readMapId();
  if (mapId === null) {
    const map = readMap();
    const videoId = readVideoId();
    void backupMap({ videoId, map });
  }
};
