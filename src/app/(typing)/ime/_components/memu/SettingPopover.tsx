import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { LabeledInput } from "@/components/ui/input/labeled-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  useImeTypeOptionsState,
  useReadImeTypeOptions,
  useReadIsImeTypeOptionsEdited,
  useSetImetypeOptions,
  useSetMap,
} from "../../_lib/atoms/stateAtoms";
import { useParseImeMap } from "../../_lib/hooks/parseImeMap";

interface SettingPopoverProps {
  triggerButton: React.ReactNode;
}

const SettingPopover = ({ triggerButton: trigger }: SettingPopoverProps) => {
  const trpc = useTRPC();
  const updateImeTypingOptions = useMutation(trpc.userTypingOption.updateImeTypeOptions.mutationOptions());
  const queryClient = useQueryClient();
  const readIsImeTypeOptionsEdited = useReadIsImeTypeOptionsEdited();
  const readImeTypeOptions = useReadImeTypeOptions();
  const parseImeMap = useParseImeMap();
  const setMap = useSetMap();
  const { id: mapId } = useParams() as { id: string };
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      const isOptionEdited = readIsImeTypeOptionsEdited();
      if (isOptionEdited) {
        updateImeTypingOptions.mutate({ ...readImeTypeOptions() });
        const mapData = queryClient.getQueryData(trpc.map.getMap.queryOptions({ mapId }).queryKey);

        if (mapData) {
          parseImeMap(mapData).then((map) => {
            setMap(map);
          });
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
                key={index}
                value={index === 0 ? "main" : `tab-${index}`}
                className="border-border bg-card text-foreground hover:bg-primary/80 hover:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md border text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabData.map((tab, index) => (
            <TabsContent key={index} value={index === 0 ? "main" : `tab-${index}`} className="px-2">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

const SettingCardDivider = () => {
  return <div className="bg-foreground my-4 h-px" />;
};

const MainSettingTab = () => {
  const userImeTypeOptions = useImeTypeOptionsState();
  const setUserImeTypeOptions = useSetImetypeOptions();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <LabeledInput
          label={
            <LabeledCheckbox
              label="判定文字追加を有効化"
              name="enableAddSymbol"
              defaultChecked={userImeTypeOptions.enable_add_symbol}
              onCheckedChange={(value: boolean) => {
                setUserImeTypeOptions({
                  enable_add_symbol: value,
                });
              }}
            />
          }
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            setUserImeTypeOptions({
              add_symbol_list: e.currentTarget.value,
            });
          }}
          value={userImeTypeOptions.add_symbol_list}
          name="addSymbol"
          disabled={!userImeTypeOptions.enable_add_symbol}
        />
      </div>
      <div className="flex">
        <LabeledCheckbox
          label="英語スペースを有効化"
          name="enableEngSpace"
          defaultChecked={userImeTypeOptions.enable_eng_space}
          onCheckedChange={(value: boolean) => {
            setUserImeTypeOptions({
              enable_eng_space: value,
            });
          }}
        />
        <LabeledCheckbox
          label="英語大文字判定を有効化"
          name="enableEngUpperCase"
          defaultChecked={userImeTypeOptions.enable_eng_upper_case}
          onCheckedChange={(value: boolean) => {
            setUserImeTypeOptions({
              enable_eng_upper_case: value,
            });
          }}
        />
      </div>

      <SettingCardDivider />

      <LabeledCheckbox
        label="次の歌詞を表示"
        name="enableNextLyrics"
        defaultChecked={userImeTypeOptions.enable_next_lyrics}
        onCheckedChange={(value: boolean) => {
          setUserImeTypeOptions({
            enable_next_lyrics: value,
          });
        }}
      />

      <LabeledCheckbox
        label="動画を大きく表示"
        name="enableLargeVideoDisplay"
        defaultChecked={userImeTypeOptions.enable_large_video_display}
        onCheckedChange={(value: boolean) => {
          setUserImeTypeOptions({
            enable_large_video_display: value,
          });
        }}
      />
    </div>
  );
};

export default SettingPopover;
