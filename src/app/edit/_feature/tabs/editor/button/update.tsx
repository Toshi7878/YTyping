import { atom, useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/ui/button";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { idb } from "../../../indexed-db";
import { dispatchEditHistory } from "../../../map-table/history";
import { getRawMap, setRawMapAction } from "../../../map-table/map-reducer";
import { getDirectEditingIndex, setDirectEditingIndex } from "../../../map-table/map-table";
import { getMapId, getVideoId } from "../../../provider";
import { YTPlayer } from "../../../youtube-player";
import { setCanUpload, setIsMapEdited } from "../../info-form/card";
import { getTimeOffset } from "../add-time-adjust";
import {
  dispatchLine,
  getSelectLine,
  getTimeValue,
  isEmptyTimeAtom,
  isSelectEndLineAtom,
  isSelectFirstLineAtom,
  isUnselectLineAtom,
} from "../line-input";
import { timeValidate } from "../time-validate";

const isUpdateButtonDisabledAtom = atom((get) => {
  const isUnselectLine = get(isUnselectLineAtom);
  const isSelectFirstLine = get(isSelectFirstLineAtom);
  const isSelectEndLine = get(isSelectEndLineAtom);
  const isEmptyTime = get(isEmptyTimeAtom);

  return isEmptyTime || isUnselectLine || isSelectEndLine || isSelectFirstLine;
});

export const UpdateLineButton = () => {
  const isUpdateButtonDisabled = useAtomValue(isUpdateButtonDisabledAtom);

  useHotkeys(
    ["shift+u", "u"],
    () => {
      if (isDialogOpen() || isUpdateButtonDisabled) return;
      updateLineAction();
    },
    { enableOnFormTags: ["slider"], preventDefault: true },
  );

  return (
    <Button
      variant="outline-info"
      disabled={isUpdateButtonDisabled}
      size="sm"
      className="w-20 font-bold xl:w-28"
      onClick={updateLineAction}
    >
      変更<small className="hidden sm:inline">(U)</small>
    </Button>
  );
};

export const updateLineAction = () => {
  const map = getRawMap();
  const { selectIndex: selectLineIndex, lyrics, word } = getSelectLine();
  if (selectLineIndex === null) return;
  const directEditingIndex = getDirectEditingIndex();
  const timeOffset = lyrics !== "" ? getTimeOffset() : 0;

  const time = timeValidate(
    YTPlayer.isPlaying() && !directEditingIndex ? YTPlayer.getCurrentTime() + timeOffset : Number(getTimeValue()),
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
    setIsMapEdited(true);
  }

  const mapId = getMapId();
  if (mapId === null) {
    const map = getRawMap();
    const videoId = getVideoId();
    void idb.backup.upsertMapJson({ videoId, map });
  }

  setRawMapAction({ type: "update", payload: newLine, index: selectLineIndex });
  dispatchLine({ type: "reset" });
  setDirectEditingIndex(null);
  setCanUpload(true);

  // if (newLine.time === oldLine.time && newLine.lyrics === oldLine.lyrics && newLine.word !== oldLine.word) {
  //   const hasKanji = /[\u4e00-\u9faf]/.test(oldLine.lyrics);
  // if (!hasKanji) return;

  // postFixWordLog.mutate({ lyrics: oldLine.lyrics, word: oldLine.word });
  // }
};
