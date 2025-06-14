import {
  useIsAddBtnDisabledState,
  useIsDeleteBtnDisabledState,
  useIsUpdateBtnDisabledState,
} from "@/app/edit/atoms/buttonDisableStateAtoms";
import { useIsWordConvertingState } from "@/app/edit/atoms/stateAtoms";
import {
  useLineAddButtonEvent,
  useLineDelete,
  useLineUpdateButtonEvent,
  useWordConvertButtonEvent,
} from "@/app/edit/hooks/useButtonEvents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

const EditorButtons = () => {
  const isAddButtonDisabled = useIsAddBtnDisabledState();
  const isUpdateButtonDisabled = useIsUpdateBtnDisabledState();
  const isDeleteButtonDisabled = useIsDeleteBtnDisabledState();

  const lineAddButtonEvent = useLineAddButtonEvent();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const lineDelete = useLineDelete();

  const isLoadWordConvert = useIsWordConvertingState();

  const buttonConfigs = {
    add: {
      isDisabled: isAddButtonDisabled,
      className: "hover:bg-success/50 border-success",
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => lineAddButtonEvent(event.shiftKey),
      text: (
        <>
          追加<small className="hidden sm:inline">(S)</small>
        </>
      ),
      isLoading: false,
    },
    update: {
      isDisabled: isUpdateButtonDisabled,
      className: "hover:bg-info/50 border-info",
      onClick: lineUpdateButtonEvent,
      text: (
        <>
          変更<small className="hidden sm:inline">(U)</small>
        </>
      ),
      isLoading: false,
    },
    wordConvert: {
      isDisabled: false,
      ref: undefined,
      isLoading: isLoadWordConvert,
      className: "hover:bg-info/50 border-info",
      onClick: wordConvertButtonEvent,
      text: (
        <>
          読み
          <wbr />
          変換
        </>
      ),
    },
    delete: {
      isDisabled: isDeleteButtonDisabled,
      className: "hover:bg-error/50 border-error",
      onClick: lineDelete,
      text: (
        <>
          削除<small className="hidden sm:inline">(Del)</small>
        </>
      ),
      isLoading: false,
    },
  };

  return (
    <div className="flex w-[50%] gap-3 lg:w-[60%] xl:w-[70%]">
      {Object.values(buttonConfigs).map((config, index) => (
        <Button
          key={index}
          disabled={config.isDisabled || config.isLoading}
          variant="outline"
          size="sm"
          className={cn("h-[35px] w-[100px]", config.className)}
          onClick={config.onClick}
        >
          {config.isLoading ? <span className="loading loading-spinner loading-xs" /> : config.text}
        </Button>
      ))}
    </div>
  );
};

export default EditorButtons;
