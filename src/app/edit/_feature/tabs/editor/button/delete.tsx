import { atom, useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/ui/button";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { idb } from "../../../indexed-db";
import { dispatchEditHistory } from "../../../map-table/history";
import { getRawMap, setRawMapAction } from "../../../map-table/map-reducer";
import { setDirectEditingIndex } from "../../../map-table/map-table";
import { getMapId, getVideoId } from "../../../provider";
import { setCanUpload, setIsMapEdited } from "../../info-form/card";
import { dispatchLine, getSelectLine, isSelectEndLineAtom, isUnselectLineAtom } from "../line-input";

const isDeleteButtonDisabledAtom = atom((get) => {
  const isNotSelectLine = get(isUnselectLineAtom);
  const isSelectLastLine = get(isSelectEndLineAtom);

  return isNotSelectLine || isSelectLastLine;
});

export const DeleteLineButton = () => {
  const isDeleteButtonDisabled = useAtomValue(isDeleteButtonDisabledAtom);

  useHotkeys(
    "delete",
    () => {
      if (isDialogOpen() || isDeleteButtonDisabled) return;
      deleteLineAction();
    },
    { enableOnFormTags: ["slider"], preventDefault: true },
  );

  return (
    <Button
      disabled={isDeleteButtonDisabled}
      variant="outline-destructive"
      size="sm"
      className="w-20 font-bold xl:w-28"
      onClick={deleteLineAction}
    >
      削除<small className="hidden sm:inline">(Del)</small>
    </Button>
  );
};

export const deleteLineAction = () => {
  const { selectIndex } = getSelectLine();

  setDirectEditingIndex(null);
  dispatchLine({ type: "reset" });
  if (!selectIndex) return;

  const map = getRawMap();
  const lineToDelete = map[selectIndex];
  if (!lineToDelete) return;

  dispatchEditHistory({
    type: "add",
    payload: { actionType: "delete", data: { ...lineToDelete, lineIndex: selectIndex } },
  });

  setRawMapAction({ type: "delete", index: selectIndex });
  setCanUpload(true);
  setIsMapEdited(true);

  const mapId = getMapId();
  if (mapId === null) {
    const map = getRawMap();
    const videoId = getVideoId();
    void idb.backup.upsertMapJson({ videoId, map });
  }
};
