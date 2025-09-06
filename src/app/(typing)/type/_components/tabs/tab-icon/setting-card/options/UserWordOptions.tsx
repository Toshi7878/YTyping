"use client";
import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter";
import { LabeledSelect } from "@/components/ui/select/labeled-select";
import { H5 } from "@/components/ui/typography";
import { $Enums } from "@prisma/client";
import { MdRestartAlt } from "react-icons/md";

const FONT_SIZE_STEP = 1;
const TOP_POSITION_STEP = 0.5;
const DEFAULT_FONT_SIZE = 100;
const DEFAULT_TOP_POSITION = 0;

const MAX_FONT_SIZE = 120;
const MIN_FONT_SIZE = 80;
const MAX_TOP_POSITION = 5;
const MIN_TOP_POSITION = -5;

export const UserWordFontSize = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const {
    kana_word_font_size,
    roma_word_font_size,
    kana_word_top_position,
    roma_word_top_position,
    main_word_display,
  } = useUserTypingOptionsState();

  const resetToDefaults = () => {
    setUserTypingOptions({
      kana_word_font_size: DEFAULT_FONT_SIZE,
      roma_word_font_size: DEFAULT_FONT_SIZE,
      kana_word_top_position: DEFAULT_TOP_POSITION,
      roma_word_top_position: DEFAULT_TOP_POSITION,
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
          step={FONT_SIZE_STEP}
          max={MAX_FONT_SIZE}
          min={MIN_FONT_SIZE}
          value={kana_word_font_size}
          label="かな表示"
          incrementTooltip="かな表示フォントサイズを大きくします。"
          decrementTooltip="かな表示フォントサイズを小さくします。"
          unit="%"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_font_size: value })}
          step={FONT_SIZE_STEP}
          max={MAX_FONT_SIZE}
          min={MIN_FONT_SIZE}
          value={roma_word_font_size}
          label="ローマ字"
          incrementTooltip="ローマ字表示フォントサイズを大きくします。"
          decrementTooltip="ローマ字表示フォントサイズを小さくします。"
          unit="%"
        />
      </div>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kana_word_top_position: value })}
          step={TOP_POSITION_STEP}
          max={MAX_TOP_POSITION}
          min={MIN_TOP_POSITION}
          value={kana_word_top_position}
          valueDigits={1}
          label="かな表示"
          incrementTooltip="かな表示を上に移動します。"
          decrementTooltip="かな表示を下に移動します。"
          unit="px"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_top_position: value })}
          step={TOP_POSITION_STEP}
          max={MAX_TOP_POSITION}
          min={MIN_TOP_POSITION}
          value={roma_word_top_position}
          valueDigits={1}
          label="ローマ字"
          incrementTooltip="ローマ字表示を上に移動します。"
          decrementTooltip="ローマ字表示を下に移動します。"
          unit="px"
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
