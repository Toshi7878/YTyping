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
import { confirmDialog } from "@/components/ui/alert-dialog/confirm-dialog";
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
import { CaseSensitiveCheckbox } from "./options/case-sensitive-checkbox";
import { HotKeySelectFields } from "./options/hot-key-select-fields";
import { SoundEffectFields } from "./options/sound-effect-fields";
import { TimeOffsetCounter } from "./options/time-offset-conter";
import { WordDisplayFields } from "./options/word-display-fields";
import { WordScrollFields } from "./options/word-scroll-fields";

export const SettingPopover = () => {
  const trpc = useTRPC();
  const updateTypingOptions = useMutation(trpc.user.typingOption.upsert.mutationOptions());
  const { isMdScreen } = useBreakPoint();
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="space-y-4">
          <TimeOffsetCounter />
          <CaseSensitiveCheckbox />
          <Separator className="my-4 bg-foreground/20" />
          <SoundEffectFields />
        </div>
      ),
    },
    {
      label: "表示設定",
      content: (
        <>
          <NextDisplayRadioGroup />
          <Separator className="my-4 bg-foreground/20" />
          <LineCompletedRadioGroup />
          <Separator className="my-4 bg-foreground/20" />
          <WordScrollFields />
          <Separator className="my-4 bg-foreground/20" />
          <WordDisplayFields />
        </>
      ),
    },
    { label: "キーボード設定", content: <HotKeySelectFields /> },
  ];

  const handleReset = async () => {
    const isConfirmed = await confirmDialog.warning({
      title: "設定をリセット",
      description: "すべての設定をデフォルトにリセットしますか？",
      actionButton: "リセットする",
    });

    if (isConfirmed) {
      resetTypingOptions();
      toast.success("設定をリセットしました");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger>
        <SettingButton />
      </PopoverTrigger>
      <PopoverContent
        className="w-screen p-4 sm:w-xl"
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

        <ResetButton onClick={handleReset} />
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

const LineCompletedRadioGroup = () => {
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

const NextDisplayRadioGroup = () => {
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

const ResetButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className="mt-4 ml-auto block text-destructive hover:bg-destructive/10"
    >
      設定をリセット
    </Button>
  );
};
