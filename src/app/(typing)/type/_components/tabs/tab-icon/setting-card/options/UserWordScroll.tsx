"use client";
import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { CounterInput } from "@/components/ui/counter";
import { H5 } from "@/components/ui/typography";

const MAX_SCROLL = 20;
const MIN_SCROLL = 0;
const SCROLL_STEP = 1;

export const UserWordScrollChange = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const { kana_word_scroll, roma_word_scroll } = useUserTypingOptionsState();

  return (
    <section className="flex flex-col gap-4">
      <H5>ワードスクロール開始位置 調整</H5>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kana_word_scroll: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={kana_word_scroll}
          label="かな表示"
          incrementTooltip="かな表示スクロールタイミングを増やします。"
          decrementTooltip="かな表示スクロールタイミングを減らします。"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_scroll: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={roma_word_scroll}
          label="ローマ字"
          incrementTooltip="ローマ字表示スクロールタイミングを増やします。"
          decrementTooltip="ローマ字表示スクロールタイミングを減らします。"
        />
      </div>
    </section>
  );
};
