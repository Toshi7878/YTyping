"use client";
import { useTranslations } from "next-intl";
import { MdRestartAlt } from "react-icons/md";
import type { WORD_DISPLAY_TYPES } from "@/server/drizzle/schema";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/schema";
import { Button } from "@/ui/button";
import { CounterInput } from "@/ui/counter";
import { LabeledSelect } from "@/ui/select/labeled-select";
import { H4 } from "@/ui/typography";
import { setTypingOptions, useTypingOptionsState } from "../popover";

const WORD_OPTIONS_CONFIG = {
  fontSize: {
    step: 1,
    max: 120,
    min: 80,
  },
  topPosition: {
    step: 0.5,
    max: 5,
    min: -5,
  },
  spacing: {
    step: 0.01,
    max: 0.2,
    min: -0.05,
  },
};

export const WordDisplayFields = () => {
  const t = useTranslations("typing.settings");
  const {
    mainWordFontSize,
    subWordFontSize,
    mainWordTopPosition,
    subWordTopPosition,
    kanaWordSpacing,
    romaWordSpacing,
    wordDisplay,
  } = useTypingOptionsState();

  const resetToDefaults = () => {
    setTypingOptions({
      mainWordFontSize: DEFAULT_TYPING_OPTIONS.mainWordFontSize,
      subWordFontSize: DEFAULT_TYPING_OPTIONS.subWordFontSize,
      mainWordTopPosition: DEFAULT_TYPING_OPTIONS.mainWordTopPosition,
      subWordTopPosition: DEFAULT_TYPING_OPTIONS.subWordTopPosition,
      kanaWordSpacing: DEFAULT_TYPING_OPTIONS.kanaWordSpacing,
      romaWordSpacing: DEFAULT_TYPING_OPTIONS.romaWordSpacing,
      wordDisplay: DEFAULT_TYPING_OPTIONS.wordDisplay,
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <H4>{t("wordTitle")}</H4>
        <Button size="sm" variant="outline" onClick={resetToDefaults}>
          <MdRestartAlt className="mr-2" />
          {t("reset")}
        </Button>
      </header>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setTypingOptions({ mainWordFontSize: value })}
          step={WORD_OPTIONS_CONFIG.fontSize.step}
          max={WORD_OPTIONS_CONFIG.fontSize.max}
          min={WORD_OPTIONS_CONFIG.fontSize.min}
          value={mainWordFontSize}
          label={t("mainSize")}
          incrementTooltip={t("kanaBigger")}
          decrementTooltip={t("kanaSmaller")}
          unit="%"
        />
        <CounterInput
          onChange={(value) => setTypingOptions({ subWordFontSize: value })}
          step={WORD_OPTIONS_CONFIG.fontSize.step}
          max={WORD_OPTIONS_CONFIG.fontSize.max}
          min={WORD_OPTIONS_CONFIG.fontSize.min}
          value={subWordFontSize}
          label={t("subSize")}
          incrementTooltip={t("romaBigger")}
          decrementTooltip={t("romaSmaller")}
          unit="%"
        />
      </div>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setTypingOptions({ mainWordTopPosition: value })}
          step={WORD_OPTIONS_CONFIG.topPosition.step}
          max={WORD_OPTIONS_CONFIG.topPosition.max}
          min={WORD_OPTIONS_CONFIG.topPosition.min}
          value={mainWordTopPosition}
          valueDigits={1}
          label={t("mainPosition")}
          incrementTooltip={t("kanaUp")}
          decrementTooltip={t("kanaDown")}
          unit="px"
        />
        <CounterInput
          onChange={(value) => setTypingOptions({ subWordTopPosition: value })}
          step={WORD_OPTIONS_CONFIG.topPosition.step}
          max={WORD_OPTIONS_CONFIG.topPosition.max}
          min={WORD_OPTIONS_CONFIG.topPosition.min}
          value={subWordTopPosition}
          valueDigits={1}
          label={t("subPosition")}
          incrementTooltip={t("romaUp")}
          decrementTooltip={t("romaDown")}
          unit="px"
        />
      </div>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setTypingOptions({ kanaWordSpacing: value })}
          step={WORD_OPTIONS_CONFIG.spacing.step}
          max={WORD_OPTIONS_CONFIG.spacing.max}
          min={WORD_OPTIONS_CONFIG.spacing.min}
          value={kanaWordSpacing}
          valueDigits={2}
          label={t("kanaSpacing")}
          incrementTooltip={t("kanaSpacingUp")}
          decrementTooltip={t("kanaSpacingDown")}
          unit="em"
        />
        <CounterInput
          onChange={(value) => setTypingOptions({ romaWordSpacing: value })}
          step={WORD_OPTIONS_CONFIG.spacing.step}
          max={WORD_OPTIONS_CONFIG.spacing.max}
          min={WORD_OPTIONS_CONFIG.spacing.min}
          value={romaWordSpacing}
          valueDigits={2}
          label={t("romaSpacing")}
          incrementTooltip={t("romaSpacingUp")}
          decrementTooltip={t("romaSpacingDown")}
          unit="em"
        />
      </div>
      <LabeledSelect
        label={t("wordDisplay")}
        options={
          [
            { label: t("KANA_ROMA_UPPERCASE"), value: "KANA_ROMA_UPPERCASE" },
            { label: t("KANA_ROMA_LOWERCASE"), value: "KANA_ROMA_LOWERCASE" },
            { label: t("ROMA_KANA_UPPERCASE"), value: "ROMA_KANA_UPPERCASE" },
            { label: t("ROMA_KANA_LOWERCASE"), value: "ROMA_KANA_LOWERCASE" },
            { label: t("KANA_ONLY"), value: "KANA_ONLY" },
            { label: t("ROMA_UPPERCASE_ONLY"), value: "ROMA_UPPERCASE_ONLY" },
            { label: t("ROMA_LOWERCASE_ONLY"), value: "ROMA_LOWERCASE_ONLY" },
          ] satisfies { label: string; value: (typeof WORD_DISPLAY_TYPES)[number] }[]
        }
        onValueChange={(value) => setTypingOptions({ wordDisplay: value as (typeof WORD_DISPLAY_TYPES)[number] })}
        value={wordDisplay}
      />
    </section>
  );
};
