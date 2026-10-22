import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  buildImeLines,
  buildImeWords,
  createFlatWords,
  createInitWordResults,
  getTotalNotes,
} from "lyrics-ime-typing-engine";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { orpc } from "@/orpc/provider";
import { CounterInput } from "@/ui/counter";
import { LabeledInput } from "@/ui/input/labeled-input";
import { LabeledCheckbox } from "@/ui/labeled-items";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { setBuiltMap } from "../../_lib/atoms/state";
import { ensureLyricsWithReadings } from "../../_lib/core/ensure-lyrics-with-readings";
import {
  getImeOptions,
  isImeTypeOptionsEdited,
  resetIsImeTypeOptionsEdited,
  setImeOptions,
  useImeOptionsState,
} from "../provider";
import { buildRuleText, setRuleText } from "../rule-display";

interface SettingPopoverProps {
  triggerButton: ReactNode;
}

export const SettingPopover = ({ triggerButton: trigger }: SettingPopoverProps) => {
  const t = useTranslations("ime.settings");
  const updateImeTypingOptions = useMutation(orpc.user.imeTypingOption.upsert.mutationOptions());
  const queryClient = useQueryClient();
  const { id: mapId } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      if (isImeTypeOptionsEdited()) {
        resetIsImeTypeOptionsEdited();
        updateImeTypingOptions.mutate({ ...getImeOptions() });
        const rawMapLines = queryClient.getQueryData(
          orpc.map.getJsonById.queryOptions({ input: { mapId: Number(mapId) } }).queryKey,
        );

        if (rawMapLines) {
          const { isCaseSensitive, includeRegexPattern, enableIncludeRegex, insertEnglishSpaces } = getImeOptions();
          const lines = await buildImeLines(rawMapLines, { isCaseSensitive, includeRegexPattern, enableIncludeRegex });
          const words = await buildImeWords(lines, ensureLyricsWithReadings, { insertEnglishSpaces });
          const totalNotes = getTotalNotes(words);
          const flatWords = createFlatWords(words);
          const initWordResults = createInitWordResults(flatWords);
          setBuiltMap({ lines, words, totalNotes, initWordResults, flatWords });
          setRuleText(buildRuleText({ insertEnglishSpaces, isCaseSensitive, enableIncludeRegex }));
        }
      }
    }
  };

  const tabData = [
    {
      label: t("main"),
      content: <MainSettingTab />,
    },
  ] as const;

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open, eventDetails) => {
        if (!open && eventDetails.reason === "outside-press") {
          const target = eventDetails.event.target as HTMLElement;
          if (target.closest("#reset-setting-modal-overlay")) {
            eventDetails.cancel();
            return;
          }
        }
        void handleOpenChange(open);
      }}
    >
      <PopoverTrigger render={trigger as ReactElement} />
      <PopoverContent className="w-[640px] p-4" align="end" side="top" sideOffset={10}>
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="mb-4 flex flex-wrap gap-2 bg-transparent">
            {tabData.map((tab, index) => (
              <TabsTrigger
                key={tab.label}
                value={index === 0 ? "main" : `tab-${index}`}
                className="rounded-md border border-border bg-card text-foreground text-sm hover:bg-primary/80 hover:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabData.map((tab, index) => (
            <TabsContent key={tab.label} value={index === 0 ? "main" : `tab-${index}`} className="px-2">
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

const LYRICS_FONT_SCALE_CONFIG = {
  step: 10,
  max: 200,
  min: 80,
};

const MainSettingTab = () => {
  const t = useTranslations("ime.settings");
  const imeOptions = useImeOptionsState();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <LabeledInput
          label={
            <LabeledCheckbox
              label={t("includeRegex")}
              defaultChecked={imeOptions.enableIncludeRegex}
              onCheckedChange={(value: boolean) => {
                setImeOptions({ enableIncludeRegex: value });
              }}
            />
          }
          onInput={(e) => {
            setImeOptions({ includeRegexPattern: e.currentTarget.value });
          }}
          value={imeOptions.includeRegexPattern}
          disabled={!imeOptions.enableIncludeRegex}
        />
      </div>
      <div className="flex">
        <LabeledCheckbox
          label={t("englishSpaces")}
          defaultChecked={imeOptions.insertEnglishSpaces}
          onCheckedChange={(value: boolean) => {
            setImeOptions({ insertEnglishSpaces: value });
          }}
        />
        <LabeledCheckbox
          label={t("caseSensitive")}
          defaultChecked={imeOptions.isCaseSensitive}
          onCheckedChange={(value: boolean) => {
            setImeOptions({ isCaseSensitive: value });
          }}
        />
      </div>

      <SettingCardDivider />

      <div className="flex flex-col gap-4">
        <CounterInput
          label={t("fontSize")}
          value={imeOptions.lyricsFontScale}
          step={LYRICS_FONT_SCALE_CONFIG.step}
          max={LYRICS_FONT_SCALE_CONFIG.max}
          min={LYRICS_FONT_SCALE_CONFIG.min}
          unit="%"
          incrementTooltip={t("fontBigger")}
          decrementTooltip={t("fontSmaller")}
          onChange={(value) => setImeOptions({ lyricsFontScale: value })}
        />
        <LabeledCheckbox
          label={t("nextLyrics")}
          defaultChecked={imeOptions.enableNextLyrics}
          onCheckedChange={(value: boolean) => {
            setImeOptions({ enableNextLyrics: value });
          }}
        />
      </div>
    </div>
  );
};
