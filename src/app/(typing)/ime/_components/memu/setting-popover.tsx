import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  buildImeLines,
  buildImeWords,
  createFlatWords,
  createInitWordResults,
  getTotalNotes,
} from "lyrics-ime-typing-engine";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { LabeledInput } from "@/components/ui/input/labeled-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/provider";
import {
  readImeTypeOptions,
  readIsImeTypeOptionsEdited,
  setBuiltMap,
  setImeOptions,
  useImeTypeOptionsState,
} from "../../_lib/atoms/state";
import { generateLyricsWithReadings } from "../../_lib/core/generate-lyrics-with-readings";

interface SettingPopoverProps {
  triggerButton: ReactNode;
}

export const SettingPopover = ({ triggerButton: trigger }: SettingPopoverProps) => {
  const trpc = useTRPC();
  const updateImeTypingOptions = useMutation(trpc.user.imeTypingOption.upsert.mutationOptions());
  const queryClient = useQueryClient();
  const { id: mapId } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      const isOptionEdited = readIsImeTypeOptionsEdited();
      if (isOptionEdited) {
        updateImeTypingOptions.mutate({ ...readImeTypeOptions() });
        const rawMapLines = queryClient.getQueryData(
          trpc.map.detail.getRawMapJson.queryOptions({ mapId: Number(mapId) }).queryKey,
        );

        if (rawMapLines) {
          const { isCaseSensitive, includeRegexPattern, enableIncludeRegex, insertEnglishSpaces } =
            readImeTypeOptions();
          const lines = await buildImeLines(rawMapLines, { isCaseSensitive, includeRegexPattern, enableIncludeRegex });
          const words = await buildImeWords(lines, generateLyricsWithReadings, { insertEnglishSpaces });
          const totalNotes = getTotalNotes(words);
          const flatWords = createFlatWords(words);
          const initWordResults = createInitWordResults(flatWords);
          setBuiltMap({ lines, words, totalNotes, initWordResults, flatWords });
        }
      }
    }
  };

  const tabData = [
    {
      label: "メイン設定",
      content: <MainSettingTab />,
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[600px] p-4"
        align="end"
        side="top"
        sideOffset={10}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("#reset-setting-modal-overlay")) {
            e.preventDefault();
          }
        }}
      >
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="mb-4 flex flex-wrap gap-2 bg-transparent">
            {tabData.map((tab, index) => (
              <TabsTrigger
                key={`${index}-${tab.label}`}
                value={index === 0 ? "main" : `tab-${index}`}
                className="rounded-md border border-border bg-card text-foreground text-sm hover:bg-primary/80 hover:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabData.map((tab, index) => (
            <TabsContent key={`${index}-${tab.label}`} value={index === 0 ? "main" : `tab-${index}`} className="px-2">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

const SettingCardDivider = () => {
  return <div className="my-4 h-px bg-foreground" />;
};

const MainSettingTab = () => {
  const userImeTypeOptions = useImeTypeOptionsState();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <LabeledInput
          label={
            <LabeledCheckbox
              label="判定文字追加を有効化"
              defaultChecked={userImeTypeOptions.enableIncludeRegex}
              onCheckedChange={(value: boolean) => {
                setImeOptions({ enableIncludeRegex: value });
              }}
            />
          }
          onInput={(e) => {
            setImeOptions({ includeRegexPattern: e.currentTarget.value });
          }}
          value={userImeTypeOptions.includeRegexPattern}
          disabled={!userImeTypeOptions.enableIncludeRegex}
        />
      </div>
      <div className="flex">
        <LabeledCheckbox
          label="英語スペースを有効化"
          defaultChecked={userImeTypeOptions.insertEnglishSpaces}
          onCheckedChange={(value: boolean) => {
            setImeOptions({ insertEnglishSpaces: value });
          }}
        />
        <LabeledCheckbox
          label="英語大文字判定を有効化"
          defaultChecked={userImeTypeOptions.isCaseSensitive}
          onCheckedChange={(value: boolean) => {
            setImeOptions({ isCaseSensitive: value });
          }}
        />
      </div>

      <SettingCardDivider />

      <LabeledCheckbox
        label="次の歌詞を表示"
        defaultChecked={userImeTypeOptions.enableNextLyrics}
        onCheckedChange={(value: boolean) => {
          setImeOptions({ enableNextLyrics: value });
        }}
      />

      <LabeledCheckbox
        label="動画を大きく表示"
        defaultChecked={userImeTypeOptions.enableLargeVideoDisplay}
        onCheckedChange={(value: boolean) => {
          setImeOptions({ enableLargeVideoDisplay: value });
        }}
      />
    </div>
  );
};
