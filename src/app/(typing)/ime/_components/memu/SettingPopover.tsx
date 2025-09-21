import { LabeledCheckbox } from "@/components/ui/checkbox/labeled-checkbox";
import { LabeledInput } from "@/components/ui/input/labeled-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
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
  triggerButton: ReactNode;
}

const SettingPopover = ({ triggerButton: trigger }: SettingPopoverProps) => {
  const trpc = useTRPC();
  const updateImeTypingOptions = useMutation(trpc.userOption.updateImeTypeOptions.mutationOptions());
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
        const mapData = queryClient.getQueryData(trpc.map.getMapJson.queryOptions({ mapId: Number(mapId) }).queryKey);

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
              defaultChecked={userImeTypeOptions.enableAddSymbol}
              onCheckedChange={(value: boolean) => {
                setUserImeTypeOptions({ enableAddSymbol: value });
              }}
            />
          }
          onInput={(e) => {
            setUserImeTypeOptions({ addSymbolList: e.currentTarget.value });
          }}
          value={userImeTypeOptions.addSymbolList}
          disabled={!userImeTypeOptions.enableAddSymbol}
        />
      </div>
      <div className="flex">
        <LabeledCheckbox
          label="英語スペースを有効化"
          defaultChecked={userImeTypeOptions.enableEngSpace}
          onCheckedChange={(value: boolean) => {
            setUserImeTypeOptions({ enableEngSpace: value });
          }}
        />
        <LabeledCheckbox
          label="英語大文字判定を有効化"
          defaultChecked={userImeTypeOptions.enableEngUpperCase}
          onCheckedChange={(value: boolean) => {
            setUserImeTypeOptions({ enableEngUpperCase: value });
          }}
        />
      </div>

      <SettingCardDivider />

      <LabeledCheckbox
        label="次の歌詞を表示"
        defaultChecked={userImeTypeOptions.enableNextLyrics}
        onCheckedChange={(value: boolean) => {
          setUserImeTypeOptions({ enableNextLyrics: value });
        }}
      />

      <LabeledCheckbox
        label="動画を大きく表示"
        defaultChecked={userImeTypeOptions.enableLargeVideoDisplay}
        onCheckedChange={(value: boolean) => {
          setUserImeTypeOptions({ enableLargeVideoDisplay: value });
        }}
      />
    </div>
  );
};

export default SettingPopover;
