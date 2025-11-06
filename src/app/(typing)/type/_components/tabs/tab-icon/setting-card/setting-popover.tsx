import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdSettings } from "react-icons/io";
import { toast } from "sonner";
import {
  readTypingOptions,
  resetTypingOptions,
  setTypingOptions,
  useTypingOptionsState,
} from "@/app/(typing)/type/_lib/atoms/hydrate";
import { readUtilityRefParams, writeUtilityRefParams } from "@/app/(typing)/type/_lib/atoms/ref";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LabeledRadioGroup } from "@/components/ui/radio-group/labeled-radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { lineCompletedDisplayEnum, nextDisplayEnum } from "@/server/drizzle/schema";
import { useTRPC } from "@/trpc/provider";
import { useBreakPoint } from "@/utils/hooks/use-break-point";
import { HotKeySelectFields } from "./options/hot-key";
import { SoundEffectOptions } from "./options/sound-effect";
import { TimeOffsetChange } from "./options/time-offset";
import { WordDisplayOptions } from "./options/word-display";
import { WordScrollOptions } from "./options/word-scroll";

export const SettingPopover = () => {
  const trpc = useTRPC();
  const updateTypingOptions = useMutation(trpc.userOption.updateTypeOptions.mutationOptions());
  const { isMdScreen } = useBreakPoint();
  const [isOpen, setIsOpen] = useState(false);
  const confirm = useConfirm();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      const { isOptionEdited } = readUtilityRefParams();

      if (isOptionEdited) {
        const typingOptions = readTypingOptions();
        updateTypingOptions.mutate(typingOptions);
        writeUtilityRefParams({ isOptionEdited: false });
      }
    }
  };

  const tabData = [
    {
      label: "メイン設定",
      content: (
        <>
          <TimeOffsetChange />
          <Separator className="bg-foreground/20 my-4" />
          <SoundEffectOptions />
        </>
      ),
    },
    {
      label: "表示設定",
      content: (
        <>
          <NextDisplayRadioOptions />
          <Separator className="bg-foreground/20 my-4" />
          <LineCompletedRadioOptions />
          <Separator className="bg-foreground/20 my-4" />
          <WordScrollOptions />
          <Separator className="bg-foreground/20 my-4" />
          <WordDisplayOptions />
        </>
      ),
    },
    { label: "キーボード設定", content: <HotKeySelectFields /> },
  ];

  const handleReset = async () => {
    const result = await confirm({
      title: "設定をリセット",
      body: "すべての設定をデフォルトにリセットしますか？この操作は元に戻せません。",
      cancelButton: "キャンセル",
      actionButton: "リセットする",
      actionButtonVariant: "warning",
      cancelButtonVariant: "outline",
    });

    if (result) {
      resetTypingOptions();
      toast.success("設定をリセットしました");
    }
  };
  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <SettingButton />
      </PopoverTrigger>
      <PopoverContent
        className={cn(isMdScreen ? "w-xl p-4" : "w-screen p-4")}
        align={isMdScreen ? "end" : "center"}
        side="bottom"
        sideOffset={10}
        alignOffset={isMdScreen ? -100 : 0}
      >
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            {tabData.map((tab, index) => (
              <TabsTrigger key={`${index}-${tab.label}`} value={index.toString()}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabData.map((tab, index) => (
            <TabsContent
              key={`${index}-${tab.label}`}
              value={index.toString()}
              className={cn("max-h-[60vh] overflow-y-scroll px-2")}
            >
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>

        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
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
        <IoMdSettings className="size-24 md:size-9" />
      </Button>
    </TooltipWrapper>
  );
};

const LineCompletedRadioOptions = () => {
  const { lineCompletedDisplay } = useTypingOptionsState();

  const items = [
    { label: "ワードハイライト", value: "HIGH_LIGHT" },
    { label: "次のワードを表示", value: "NEXT_WORD" },
  ];

  return (
    <LabeledRadioGroup
      label="打ち切り時のワード表示"
      labelClassName="mb-2 block text-lg font-semibold"
      value={lineCompletedDisplay}
      onValueChange={(value) => {
        setTypingOptions({ lineCompletedDisplay: value as (typeof lineCompletedDisplayEnum.enumValues)[number] });
      }}
      className="flex flex-row gap-5"
      items={items}
    />
  );
};

const NextDisplayRadioOptions = () => {
  const { nextDisplay } = useTypingOptionsState();

  const items = [
    { label: "歌詞", value: "LYRICS" },
    { label: "ワード", value: "WORD" },
  ];

  return (
    <LabeledRadioGroup
      value={nextDisplay}
      onValueChange={(value) => {
        setTypingOptions({ nextDisplay: value as (typeof nextDisplayEnum.enumValues)[number] });
      }}
      label="次の歌詞表示"
      className="flex flex-row gap-5"
      labelClassName="text-lg font-semibold"
      items={items}
    />
  );
};
