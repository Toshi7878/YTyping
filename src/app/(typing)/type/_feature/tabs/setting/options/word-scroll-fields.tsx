"use client";
import { useTranslations } from "next-intl";
import { CounterInput } from "@/ui/counter";
import { LabeledRadioGroup } from "@/ui/radio-group/labeled-radio-group";
import { H4 } from "@/ui/typography";
import { setTypingOptions, useTypingOptionsState } from "../popover";

const MAX_SCROLL = 80;
const MIN_SCROLL = 5;
const SCROLL_STEP = 5;

export const WordScrollFields = () => {
  const t = useTranslations("typing.settings");
  const { mainWordScrollStart, subWordScrollStart } = useTypingOptionsState();

  return (
    <section className="flex flex-col gap-4">
      <H4>{t("wordScrollTitle")}</H4>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setTypingOptions({ mainWordScrollStart: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={mainWordScrollStart}
          label={t("mainStart")}
          decrementTooltip={t("mainStartLeft")}
          incrementTooltip={t("mainStartRight")}
        />
        <CounterInput
          onChange={(value) => setTypingOptions({ subWordScrollStart: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={subWordScrollStart}
          label={t("subStart")}
          decrementTooltip={t("subStartLeft")}
          incrementTooltip={t("subStartRight")}
        />
      </div>
      <WordScrollAnimationRadioOptions />
    </section>
  );
};

const WordScrollAnimationRadioOptions = () => {
  const t = useTranslations("typing.settings");
  const { isSmoothScroll } = useTypingOptionsState();

  const items: { label: string; value: "smooth" | "instant" }[] = [
    { label: t("scrollAnimOn"), value: "smooth" },
    { label: t("scrollAnimOff"), value: "instant" },
  ];

  return (
    <LabeledRadioGroup
      label={t("scrollAnimation")}
      value={isSmoothScroll ? "smooth" : "instant"}
      onValueChange={(value: "smooth" | "instant") => {
        setTypingOptions({ isSmoothScroll: value === "smooth" });
      }}
      className="flex flex-row gap-5"
      items={items}
    />
  );
};
