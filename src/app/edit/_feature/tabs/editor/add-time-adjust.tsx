"use client";

import type { ExtractAtomValue } from "jotai";
import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useTranslations } from "next-intl";
import { store } from "@/app/edit/_feature/provider";
import { CounterInput } from "@/ui/counter";
import { TooltipWrapper } from "@/ui/tooltip";

const timeOffsetAtom = atomWithStorage("editor_playing_time_offset", -0.2, undefined, {
  getOnInit: true,
});

export const setTimeOffset = (value: ExtractAtomValue<typeof timeOffsetAtom>) => store.set(timeOffsetAtom, value);
export const getTimeOffset = () => store.get(timeOffsetAtom);

const MAX_TIME_OFFSET = -0.1;
const MIN_TIME_OFFSET = -0.4;
const TIME_OFFSET_STEP = 0.01;

export const AddTimeAdjust = () => {
  const t = useTranslations("editorTab.timeAdjust");
  const timeOffset = useAtomValue(timeOffsetAtom, { store });

  return (
    <TooltipWrapper
      delayDuration={300}
      label={
        <div>
          <div>
            <strong>{t("recommended")}</strong>
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium">{t("featureLabel")}</span>
                {t("feature")}
              </div>
              <div>
                <span className="font-medium">{t("effectLabel")}</span>
                {t("effect")}
              </div>
            </div>

            <div className="mt-2">{t("bluetooth")}</div>
          </div>
        </div>
      }
    >
      {/* tooltipを使用しているためdivでラップしている */}
      <div>
        <CounterInput
          value={timeOffset}
          onChange={(value) => setTimeOffset(value)}
          step={TIME_OFFSET_STEP}
          max={MAX_TIME_OFFSET}
          min={MIN_TIME_OFFSET}
          valueDigits={2}
          label={t("label")}
          size="sm"
        />
      </div>
    </TooltipWrapper>
  );
};
