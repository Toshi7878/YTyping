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
import React from "react";
import EditorButton from "./child/EditorButton";

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
      colorScheme: "green",
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
      colorScheme: "blue",
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
      colorScheme: "blue",
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
      colorScheme: "red",
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
    <div className="flex gap-3 w-[50%] lg:w-[60%] xl:w-[70%]">
      {Object.values(buttonConfigs).map((config, index) => (
        <EditorButton
          key={index}
          isDisabled={config.isDisabled}
          isLoading={config.isLoading}
          colorScheme={config.colorScheme as string}
          onClick={config.onClick}
        >
          {config.text}
        </EditorButton>
      ))}
    </div>
  );
};

export default EditorButtons;
