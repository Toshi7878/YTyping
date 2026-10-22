"use client";
import { useTranslations } from "next-intl";

import { CounterInput } from "@/ui/counter";
import { useYTSpeed, YTPlayer } from "../youtube-player";

export const SpeedCounter = () => {
  const t = useTranslations("editor");
  const speed = useYTSpeed();

  return (
    <CounterInput
      variant="minimal"
      value={speed}
      max={2}
      min={0.25}
      step={0.25}
      valueDigits={2}
      onChange={(value: number) => YTPlayer.setSpeed(value)}
      unit={t("speed")}
      minusButtonHotkey="f9"
      plusButtonHotkey="f10"
    />
  );
};
