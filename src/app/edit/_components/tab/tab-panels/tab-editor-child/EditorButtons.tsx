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
      variant: "outline-success" as const,
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
      variant: "outline-info" as const,
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
      variant: "outline-info" as const,
      onClick: wordConvertButtonEvent,
      text: <>読み変換</>,
    },
    delete: {
      isDisabled: isDeleteButtonDisabled,
      variant: "outline-error" as const,
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
    <div className="grid grid-cols-2 gap-2 sm:flex">
      {Object.values(buttonConfigs).map((config, index) => (
        <Button
          key={index}
          disabled={config.isDisabled || config.isLoading}
          variant={config.variant}
          size="sm"
          className="md: w-28"
          onClick={config.onClick}
        >
          {config.isLoading ? <span className="loading loading-spinner loading-xs" /> : config.text}
        </Button>
      ))}
    </div>
  );
};

export default EditorButtons;
