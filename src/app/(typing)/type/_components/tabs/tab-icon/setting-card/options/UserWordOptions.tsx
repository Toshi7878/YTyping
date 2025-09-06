"use client";
import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter";
import { LabeledSelect } from "@/components/ui/select/labeled-select";
import { H5 } from "@/components/ui/typography";
import { $Enums } from "@prisma/client";
import { MdRestartAlt } from "react-icons/md";

const WORD_OPTIONS_CONFIG = {
  fontSize: {
    step: 1,
    default: 100,
    max: 120,
    min: 80,
  },
  topPosition: {
    step: 0.5,
    default: 0,
    max: 5,
    min: -5,
  },
  spacing: {
    step: 0.01,
    default: 0.08,
    max: 0.2,
    min: -0.05,
  },
};

export const UserWordOptions = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const {
    kana_word_font_size,
    roma_word_font_size,
    kana_word_top_position,
    roma_word_top_position,
    kana_word_spacing,
    roma_word_spacing,
    main_word_display,
  } = useUserTypingOptionsState();

  const resetToDefaults = () => {
    setUserTypingOptions({
      kana_word_font_size: WORD_OPTIONS_CONFIG.fontSize.default,
      roma_word_font_size: WORD_OPTIONS_CONFIG.fontSize.default,
      kana_word_top_position: WORD_OPTIONS_CONFIG.topPosition.default,
      roma_word_top_position: WORD_OPTIONS_CONFIG.topPosition.default,
      kana_word_spacing: WORD_OPTIONS_CONFIG.spacing.default,
      roma_word_spacing: WORD_OPTIONS_CONFIG.spacing.default,
      main_word_display: "KANA_ROMA_UPPERCASE",
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <H5>ワード表示調整</H5>
        <Button size="sm" variant="outline" onClick={resetToDefaults}>
          <MdRestartAlt className="mr-2" />
          リセット
        </Button>
      </header>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kana_word_font_size: value })}
          step={WORD_OPTIONS_CONFIG.fontSize.step}
          max={WORD_OPTIONS_CONFIG.fontSize.max}
          min={WORD_OPTIONS_CONFIG.fontSize.min}
          value={kana_word_font_size}
          label="かなサイズ"
          incrementTooltip="かな表示フォントサイズを大きくします。"
          decrementTooltip="かな表示フォントサイズを小さくします。"
          unit="%"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_font_size: value })}
          step={WORD_OPTIONS_CONFIG.fontSize.step}
          max={WORD_OPTIONS_CONFIG.fontSize.max}
          min={WORD_OPTIONS_CONFIG.fontSize.min}
          value={roma_word_font_size}
          label="ローマ字サイズ"
          incrementTooltip="ローマ字表示フォントサイズを大きくします。"
          decrementTooltip="ローマ字表示フォントサイズを小さくします。"
          unit="%"
        />
      </div>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kana_word_top_position: value })}
          step={WORD_OPTIONS_CONFIG.topPosition.step}
          max={WORD_OPTIONS_CONFIG.topPosition.max}
          min={WORD_OPTIONS_CONFIG.topPosition.min}
          value={kana_word_top_position}
          valueDigits={1}
          label="かな位置"
          incrementTooltip="かな表示を上に移動します。"
          decrementTooltip="かな表示を下に移動します。"
          unit="px"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_top_position: value })}
          step={WORD_OPTIONS_CONFIG.topPosition.step}
          max={WORD_OPTIONS_CONFIG.topPosition.max}
          min={WORD_OPTIONS_CONFIG.topPosition.min}
          value={roma_word_top_position}
          valueDigits={1}
          label="ローマ字位置"
          incrementTooltip="ローマ字表示を上に移動します。"
          decrementTooltip="ローマ字表示を下に移動します。"
          unit="px"
        />
      </div>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kana_word_spacing: value })}
          step={WORD_OPTIONS_CONFIG.spacing.step}
          max={WORD_OPTIONS_CONFIG.spacing.max}
          min={WORD_OPTIONS_CONFIG.spacing.min}
          value={kana_word_spacing}
          valueDigits={2}
          label="かな間隔"
          incrementTooltip="かな表示の文字間隔を大きくします。"
          decrementTooltip="かな表示の文字間隔を小さくします。"
          unit="em"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_spacing: value })}
          step={WORD_OPTIONS_CONFIG.spacing.step}
          max={WORD_OPTIONS_CONFIG.spacing.max}
          min={WORD_OPTIONS_CONFIG.spacing.min}
          value={roma_word_spacing}
          valueDigits={2}
          label="ローマ字間隔"
          incrementTooltip="ローマ字表示の文字間隔を大きくします。"
          decrementTooltip="ローマ字表示の文字間隔を小さくします。"
          unit="em"
        />
      </div>
      <LabeledSelect
        label="ワード表示方式"
        options={[
          { label: "↑かな↓ローマ字大文字", value: "KANA_ROMA_UPPERCASE" },
          { label: "↑かな↓ローマ字小文字", value: "KANA_ROMA_LOWERCASE" },
          { label: "↑ローマ字↓かな大文字", value: "ROMA_KANA_UPPERCASE" },
          { label: "↑ローマ字↓かな小文字", value: "ROMA_KANA_LOWERCASE" },
          { label: "かなのみ", value: "KANA_ONLY" },
          { label: "ローマ字大文字のみ", value: "ROMA_UPPERCASE_ONLY" },
          { label: "ローマ字小文字のみ", value: "ROMA_LOWERCASE_ONLY" },
        ]}
        onValueChange={(value: $Enums.main_word_display) => setUserTypingOptions({ main_word_display: value })}
        value={main_word_display}
      />
    </section>
  );
};
