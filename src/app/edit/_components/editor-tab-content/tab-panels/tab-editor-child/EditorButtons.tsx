import {
  useIsAddButtonDisabled,
  useIsDeleteButtonDisabledAtom,
  useIsLoadWordConvertAtom,
  useIsUpdateButtonDisabledAtom,
} from "@/app/edit/edit-atom/editAtom";
import {
  useLineAddButtonEvent,
  useLineDelete,
  useLineUpdateButtonEvent,
  useWordConvertButtonEvent,
} from "@/app/edit/hooks/useEditorButtonEvents";
import { ThemeColors } from "@/types";
import { Flex, useTheme } from "@chakra-ui/react";
import React from "react";
import EditorButton from "./child/EditorButton";

const EditorButtons = () => {
  const theme: ThemeColors = useTheme();

  const isAddButtonDisabled = useIsAddButtonDisabled();
  const isUpdateButtonDisabled = useIsUpdateButtonDisabledAtom();
  const isDeleteButtonDisabled = useIsDeleteButtonDisabledAtom();

  const lineAddButtonEvent = useLineAddButtonEvent();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const lineDelete = useLineDelete();

  const isLoadWordConvert = useIsLoadWordConvertAtom();

  const buttonConfigs = {
    add: {
      isDisabled: isAddButtonDisabled,
      colorScheme: theme.colors.secondary.light,
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
      colorScheme: theme.colors.primary.dark,
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
      colorScheme: theme.colors.primary.dark,
      onClick: wordConvertButtonEvent,
      text: "読み変換",
    },
    delete: {
      isDisabled: isDeleteButtonDisabled,
      colorScheme: theme.colors.error.light,
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
    <Flex gap="3" className="w-[50%] lg:w-[60%] xl:w-[70%]">
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
    </Flex>
  );
};

export default EditorButtons;
