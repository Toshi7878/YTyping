import { atom, useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/ui/button";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { normalizeSymbols } from "@/utils/string";
import type { RawMapLine } from "@/validator/map/raw-map-json";
import { idb } from "../../../indexed-db";
import { dispatchEditHistory } from "../../../map-table/history";
import { getRawMap, setRawMapAction } from "../../../map-table/map-reducer";
import { setDirectEditingIndex } from "../../../map-table/map-table";
import { scrollMapTableToRow } from "../../../map-table/scroll";
import { getMapId, getVideoId } from "../../../provider";
import { YTPlayer } from "../../../youtube-player";
import { setCanUpload, setIsMapEdited } from "../../info-form/card";
import { getTimeOffset } from "../add-time-adjust";
import { deleteTopPhrase, getManyPhraseText, pickupTopPhrase } from "../many-phrase-textarea";
import { dispatchLine, getSelectLine, getTimeValue, isEmptyTimeAtom } from "../select-line-input";
import { timeValidate } from "../time-validate";

const isAddButtonDisabledAtom = atom((get) => {
  const isEmptyTime = get(isEmptyTimeAtom);
  return isEmptyTime;
});

export const AddLineButton = () => {
  const isAddButtonDisabled = useAtomValue(isAddButtonDisabledAtom);
  useHotkeys(
    ["shift+s", "s"],
    (event) => {
      if (isDialogOpen() || isAddButtonDisabled) return;
      addLineAction(event.shiftKey);
    },
    { enableOnFormTags: ["slider"], preventDefault: true },
  );
  return (
    <Button
      disabled={isAddButtonDisabled}
      variant="outline-success"
      size="sm"
      className="w-20 font-bold xl:w-28"
      onClick={(event) => addLineAction(event.shiftKey)}
    >
      追加<small className="hidden sm:inline">(S)</small>
    </Button>
  );
};

const addLineAction = (isShiftKey: boolean) => {
  const isPlaying = YTPlayer.isPlaying();
  const { lyrics, word } = getSelectLine();
  const timeOffset = lyrics !== "" && !isShiftKey ? getTimeOffset() : 0;

  const time = timeValidate(isPlaying ? YTPlayer.getCurrentTime() + timeOffset : Number(getTimeValue())).toFixed(3);

  const newLine: RawMapLine = !isShiftKey
    ? { time, lyrics, word: normalizeSymbols(word) }
    : { time, lyrics: "", word: "" };

  setRawMapAction({ type: "add", payload: newLine });
  const lineIndex = getRawMap().findIndex((line) => JSON.stringify(line) === JSON.stringify(newLine));
  dispatchEditHistory({ type: "add", payload: { actionType: "add", data: { ...newLine, lineIndex } } });

  const mapId = getMapId();
  if (mapId === null) {
    const map = getRawMap();
    const videoId = getVideoId();
    void idb.backup.upsertMapJson({ videoId, map });
  }

  setCanUpload(true);
  setIsMapEdited(true);
  setDirectEditingIndex(null);

  //フォーカスを外さないと追加ボタンクリック時にテーブルがスクロールされない
  (document.activeElement as HTMLElement)?.blur();

  setTimeout(() => scrollMapTableToRow({ rowIndex: lineIndex }));

  if (isShiftKey) return;

  dispatchLine({ type: "reset" });
  const lyricsCopy = structuredClone(lyrics);
  deleteTopPhrase(lyricsCopy);
  const manyPhraseText = getManyPhraseText();
  const topPhrase = manyPhraseText.split("\n")[0] ?? "";
  void pickupTopPhrase(topPhrase);
};
