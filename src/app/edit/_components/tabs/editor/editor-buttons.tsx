import { useHotkeys } from "react-hotkeys-hook";
import {
  useIsAddBtnDisabledState,
  useIsDeleteBtnDisabledState,
  useIsUpdateBtnDisabledState,
} from "@/app/edit/_lib/atoms/button-disable-state-atoms";
import { useIsWordConvertingState } from "@/app/edit/_lib/atoms/state-atoms";
import {
  useLineAddButtonEvent,
  useLineDelete,
  useLineUpdateButtonEvent,
  useWordConvertButtonEvent,
} from "@/app/edit/_lib/hooks/use-editor-button-events";
import { Button } from "@/components/ui/button";

const EditorButtons = () => {
  const isAddButtonDisabled = useIsAddBtnDisabledState();
  const isUpdateButtonDisabled = useIsUpdateBtnDisabledState();
  const isWordConverting = useIsWordConvertingState();
  const isDeleteButtonDisabled = useIsDeleteBtnDisabledState();
  const lineAddButtonEvent = useLineAddButtonEvent();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const lineDelete = useLineDelete();
  useHotkeys(
    ["shift+s", "s"],
    (event) => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (isDialogOpen || isAddButtonDisabled) return;
      lineAddButtonEvent(event.shiftKey);
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
  );

  useHotkeys(
    ["shift+u", "u"],
    () => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (isDialogOpen || isUpdateButtonDisabled) return;
      lineUpdateButtonEvent();
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
  );

  useHotkeys("delete", () => {
    const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
    if (isDialogOpen || isDeleteButtonDisabled) return;
    lineDelete();
  });

  const buttonConfigs = {
    add: {
      isDisabled: isAddButtonDisabled,
      variant: "outline-success",
      onClick: (event: { shiftKey: boolean }) => lineAddButtonEvent(event.shiftKey),
      text: (
        <>
          追加<small className="hidden sm:inline">(S)</small>
        </>
      ),
      isLoading: false,
    },
    update: {
      isDisabled: isUpdateButtonDisabled,
      variant: "outline-info",
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
      isLoading: isWordConverting,
      variant: "outline-info",
      onClick: wordConvertButtonEvent,
      text: <>読み変換</>,
    },
    delete: {
      isDisabled: isDeleteButtonDisabled,
      variant: "outline-destructive",
      onClick: lineDelete,
      text: (
        <>
          削除<small className="hidden sm:inline">(Del)</small>
        </>
      ),
      isLoading: false,
    },
  } as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex">
      {Object.values(buttonConfigs).map((config, index) => (
        <Button
          key={index}
          disabled={config.isDisabled || config.isLoading}
          variant={config.variant}
          size="sm"
          className="w-20 font-bold xl:w-28"
          onClick={config.onClick}
          loading={config.isLoading}
        >
          {config.isLoading ? <span className="loading loading-spinner loading-xs" /> : config.text}
        </Button>
      ))}
    </div>
  );
};

export default EditorButtons;
