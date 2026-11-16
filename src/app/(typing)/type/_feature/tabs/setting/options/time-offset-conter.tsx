"use client";
import { useTranslations } from "next-intl";
import { CounterInput } from "@/ui/counter";
import { setTypingOptions, useTypingOptionsState } from "../popover";

const MAX_TIME_OFFSET = 1;
const MIN_TIME_OFFSET = -1;
const TIME_OFFSET_STEP = 0.05;

export const TimeOffsetCounter = () => {
  const t = useTranslations("typing.settings");
  const { timeOffset } = useTypingOptionsState();
  return (
    <CounterInput
      value={timeOffset}
      onChange={(value) => setTypingOptions({ timeOffset: value })}
      step={TIME_OFFSET_STEP}
      max={MAX_TIME_OFFSET}
      min={MIN_TIME_OFFSET}
      valueDigits={2}
      decrementTooltip={t("timeEarlier")}
      incrementTooltip={t("timeLater")}
      label={t("timeOffset")}
      size="lg"
    />
  );
};
