"use client";
import { MdRestartAlt } from "react-icons/md";
import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter";
import { LabeledSelect } from "@/components/ui/select/labeled-select";
import { H4 } from "@/components/ui/typography";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";
import type { mainWordDisplayEnum } from "@/server/drizzle/schema";

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

export const WordDisplayOptions = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const {
    mainWordFontSize,
    subWordFontSize,
    mainWordTopPosition,
    subWordTopPosition,
    kanaWordSpacing,
    romaWordSpacing,
    wordDisplay,
  } = useUserTypingOptionsState();

  const resetToDefaults = () => {
    setUserTypingOptions({
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
        <H4>ワード表示調整</H4>
        <Button size="sm" variant="outline" onClick={resetToDefaults}>
          <MdRestartAlt className="mr-2" />
          リセット
        </Button>
      </header>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ mainWordFontSize: value })}
          step={WORD_OPTIONS_CONFIG.fontSize.step}
          max={WORD_OPTIONS_CONFIG.fontSize.max}
          min={WORD_OPTIONS_CONFIG.fontSize.min}
          value={mainWordFontSize}
          label="メインサイズ"
          incrementTooltip="かな表示フォントサイズを大きくします。"
          decrementTooltip="かな表示フォントサイズを小さくします。"
          unit="%"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ subWordFontSize: value })}
          step={WORD_OPTIONS_CONFIG.fontSize.step}
          max={WORD_OPTIONS_CONFIG.fontSize.max}
          min={WORD_OPTIONS_CONFIG.fontSize.min}
          value={subWordFontSize}
          label="サブサイズ"
          incrementTooltip="ローマ字表示フォントサイズを大きくします。"
          decrementTooltip="ローマ字表示フォントサイズを小さくします。"
          unit="%"
        />
      </div>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ mainWordTopPosition: value })}
          step={WORD_OPTIONS_CONFIG.topPosition.step}
          max={WORD_OPTIONS_CONFIG.topPosition.max}
          min={WORD_OPTIONS_CONFIG.topPosition.min}
          value={mainWordTopPosition}
          valueDigits={1}
          label="メイン位置"
          incrementTooltip="かな表示を上に移動します。"
          decrementTooltip="かな表示を下に移動します。"
          unit="px"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ subWordTopPosition: value })}
          step={WORD_OPTIONS_CONFIG.topPosition.step}
          max={WORD_OPTIONS_CONFIG.topPosition.max}
          min={WORD_OPTIONS_CONFIG.topPosition.min}
          value={subWordTopPosition}
          valueDigits={1}
          label="サブ位置"
          incrementTooltip="ローマ字表示を上に移動します。"
          decrementTooltip="ローマ字表示を下に移動します。"
          unit="px"
        />
      </div>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kanaWordSpacing: value })}
          step={WORD_OPTIONS_CONFIG.spacing.step}
          max={WORD_OPTIONS_CONFIG.spacing.max}
          min={WORD_OPTIONS_CONFIG.spacing.min}
          value={kanaWordSpacing}
          valueDigits={2}
          label="かな間隔"
          incrementTooltip="かな表示の文字間隔を大きくします。"
          decrementTooltip="かな表示の文字間隔を小さくします。"
          unit="em"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ romaWordSpacing: value })}
          step={WORD_OPTIONS_CONFIG.spacing.step}
          max={WORD_OPTIONS_CONFIG.spacing.max}
          min={WORD_OPTIONS_CONFIG.spacing.min}
          value={romaWordSpacing}
          valueDigits={2}
          label="ローマ字間隔"
          incrementTooltip="ローマ字表示の文字間隔を大きくします。"
          decrementTooltip="ローマ字表示の文字間隔を小さくします。"
          unit="em"
        />
      </div>
      <LabeledSelect
        label="ワード表示方式"
        options={
          [
            { label: "↑かな↓ローマ字大文字", value: "KANA_ROMA_UPPERCASE" },
            { label: "↑かな↓ローマ字小文字", value: "KANA_ROMA_LOWERCASE" },
            { label: "↑ローマ字↓かな大文字", value: "ROMA_KANA_UPPERCASE" },
            { label: "↑ローマ字↓かな小文字", value: "ROMA_KANA_LOWERCASE" },
            { label: "かなのみ", value: "KANA_ONLY" },
            { label: "ローマ字大文字のみ", value: "ROMA_UPPERCASE_ONLY" },
            { label: "ローマ字小文字のみ", value: "ROMA_LOWERCASE_ONLY" },
          ] satisfies { label: string; value: (typeof mainWordDisplayEnum.enumValues)[number] }[]
        }
        onValueChange={(value: (typeof mainWordDisplayEnum.enumValues)[number]) =>
          setUserTypingOptions({ wordDisplay: value })
        }
        value={wordDisplay}
      />
    </section>
  );
};
