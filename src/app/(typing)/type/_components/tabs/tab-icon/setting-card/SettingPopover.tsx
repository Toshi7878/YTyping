import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import {
  useSetUserTypingOptions,
  useUserTypingOptionsState,
  useUserTypingOptionsStateRef,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LabeledRadioGroup, LabeledRadioItem } from "@/components/ui/radio-group/labeled-radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useBreakPoint } from "@/lib/useBreakPoint";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { $Enums } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdSettings } from "react-icons/io";
import { toast } from "sonner";
import UserShortcutKeyCheckbox from "./options/UserShortcutKey";
import UserSoundEffectCheckbox from "./options/UserSoundEffect";
import UserTimeOffsetChange from "./options/UserTimeOffset";
import { UserWordFontSize } from "./options/UserWordOptions";
import { UserWordScrollChange } from "./options/UserWordScroll";

const SettingPopover = () => {
  const trpc = useTRPC();
  const updateTypingOptions = useMutation(trpc.userTypingOption.updateTypeOptions.mutationOptions());
  const { isMdScreen } = useBreakPoint();
  const [isOpen, setIsOpen] = useState(false);
  const confirm = useConfirm();
  const { resetUserTypingOptions } = useSetUserTypingOptions();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readUserTypingOptions = useUserTypingOptionsStateRef();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      const isOptionEdited = readUserTypingOptions();

      if (isOptionEdited) {
        const userOptions = readUserTypingOptions();
        updateTypingOptions.mutate(userOptions);
        writeGameUtilRefParams({ isOptionEdited: false });
      }
    }
  };

  const tabData = [
    {
      label: "メイン設定",
      content: (
        <>
          <UserTimeOffsetChange />
          <Separator className="bg-foreground/20 my-4" />
          <UserSoundEffectCheckbox />
        </>
      ),
    },
    {
      label: "表示設定",
      content: (
        <>
          <UserNextDisplayRadioButton />
          <Separator className="bg-foreground/20 my-4" />
          <UserLineCompletedRadioButton />
          <Separator className="bg-foreground/20 my-4" />
          <UserWordFontSize />
          {isMdScreen && (
            <>
              <Separator className="bg-foreground/20 my-4" />
              <UserWordScrollChange />
            </>
          )}
        </>
      ),
    },
    { label: "キーボード設定", content: <UserShortcutKeyCheckbox /> },
  ];

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <SettingButton />
      </PopoverTrigger>
      <PopoverContent
        className={cn(isMdScreen ? "w-lg p-4" : "w-screen p-4")}
        align={isMdScreen ? "end" : "center"}
        side="bottom"
        sideOffset={10}
        alignOffset={isMdScreen ? -100 : 0}
      >
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            {tabData.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabData.map((tab, index) => (
            <TabsContent
              key={index}
              value={index.toString()}
              className={cn("max-h-[50vh] overflow-y-scroll px-2 lg:max-h-max lg:overflow-y-auto")}
            >
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>

        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const result = await confirm({
              title: "設定をリセット",
              body: "すべての設定をデフォルトにリセットしますか？この操作は元に戻せません。",
              cancelButton: "キャンセル",
              actionButton: "リセットする",
              actionButtonVariant: "warning",
              cancelButtonVariant: "outline",
            });
            if (result) {
              resetUserTypingOptions();
              toast.success("設定をリセットしました");
            }
          }}
          className="text-destructive hover:bg-destructive/10 mt-4 ml-auto block"
        >
          設定をリセット
        </Button>
      </PopoverContent>
    </Popover>
  );
};

const SettingButton = () => {
  return (
    <TooltipWrapper label="設定" delayDuration={500}>
      <Button variant="unstyled" size="icon" className="hover:text-foreground/90" asChild>
        <IoMdSettings className="size-16 md:size-9" />
      </Button>
    </TooltipWrapper>
  );
};

const UserLineCompletedRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const { line_completed_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.line_completed_display) => {
    setUserTypingOptions({ line_completed_display: value });
  };

  return (
    <LabeledRadioGroup
      label="打ち切り時のワード表示"
      labelClassName="mb-2 block text-lg font-semibold"
      value={line_completed_display}
      onValueChange={changeRadio}
      className="flex flex-row gap-5"
    >
      <LabeledRadioItem value="HIGH_LIGHT" label="ワードハイライト" />
      <LabeledRadioItem value="NEXT_WORD" label="次のワードを表示" />
    </LabeledRadioGroup>
  );
};

const UserNextDisplayRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const { next_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.next_display) => {
    setUserTypingOptions({ next_display: value });
  };

  return (
    <LabeledRadioGroup
      value={next_display}
      onValueChange={changeRadio}
      label="次の歌詞表示"
      className="flex flex-row gap-5"
      labelClassName="text-lg font-semibold"
    >
      <LabeledRadioItem value="LYRICS" label="歌詞" />
      <LabeledRadioItem value="WORD" label="ワード" />
    </LabeledRadioGroup>
  );
};

export default SettingPopover;
