import { useSession } from "next-auth/react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  useIsAddBtnDisabledState,
  useIsDeleteBtnDisabledState,
  useIsUpdateBtnDisabledState,
} from "@/app/edit/_lib/atoms/button-disabled-state";
import { useCreatorIdState, useIsWordConvertingState } from "@/app/edit/_lib/atoms/state";
import {
  addLineAction,
  deleteLineAction,
  updateLineAction,
  wordConvertAction,
} from "@/app/edit/_lib/editor/editor-actions";
import { hasMapUploadPermission } from "@/app/edit/_lib/map-table/has-map-upload-permission";
import { Button } from "@/components/ui/button";

export const AddLineButton = () => {
  const isAddButtonDisabled = useIsAddBtnDisabledState();
  useHotkeys(
    ["shift+s", "s"],
    (event) => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (isDialogOpen || isAddButtonDisabled) return;
      addLineAction(event.shiftKey);
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
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

export const UpdateLineButton = () => {
  const isUpdateButtonDisabled = useIsUpdateBtnDisabledState();

  useHotkeys(
    ["shift+u", "u"],
    () => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (isDialogOpen || isUpdateButtonDisabled) return;
      updateLineAction();
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
  );

  return (
    <Button variant="outline-info" size="sm" className="w-20 font-bold xl:w-28" onClick={updateLineAction}>
      変更<small className="hidden sm:inline">(U)</small>
    </Button>
  );
};

export const WordConvertButton = () => {
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);
  const isWordConverting = useIsWordConvertingState();

  return (
    <Button
      loading={isWordConverting}
      variant="outline-info"
      size="sm"
      className="w-20 font-bold xl:w-28"
      onClick={() => wordConvertAction(hasUploadPermission)}
    >
      読み変換
    </Button>
  );
};

export const DeleteLineButton = () => {
  const isDeleteButtonDisabled = useIsDeleteBtnDisabledState();

  useHotkeys("delete", () => {
    const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
    if (isDialogOpen || isDeleteButtonDisabled) return;
    deleteLineAction();
  });

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
