"use client";
import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { CounterInput } from "@/components/ui/counter";
import { LabeledRadioGroup } from "@/components/ui/radio-group/labeled-radio-group";
import { H4 } from "@/components/ui/typography";

const MAX_SCROLL = 80;
const MIN_SCROLL = 5;
const SCROLL_STEP = 5;

export const WordScrollOptions = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const { kanaWordScroll, romaWordScroll } = useUserTypingOptionsState();

  return (
    <section className="flex flex-col gap-4">
      <H4>ワードスクロール設定</H4>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kanaWordScroll: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={kanaWordScroll}
          label="かな開始位置"
          decrementTooltip="かな表示スクロール開始位置を左に移動します"
          incrementTooltip="かな表示スクロール開始位置を右に移動します"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ romaWordScroll: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={romaWordScroll}
          label="ローマ字開始位置"
          decrementTooltip="ローマ字表示スクロール開始位置を左に移動します"
          incrementTooltip="ローマ字表示スクロール開始位置を右に移動します"
        />
      </div>
      <WordScrollAnimationRadioOptions />
    </section>
  );
};

const WordScrollAnimationRadioOptions = () => {
  const { setUserTypingOptions } = useSetUserTypingOptions();
  const { isSmoothScroll } = useUserTypingOptionsState();

  const onValueChange = (value: "smooth" | "instant") => {
    setUserTypingOptions({ isSmoothScroll: value === "smooth" });
  };

  const items = [
    { label: "アニメーションあり", value: "smooth" },
    { label: "アニメーションなし", value: "instant" },
  ];

  return (
    <LabeledRadioGroup
      label="スクロールアニメーション"
      value={isSmoothScroll ? "smooth" : "instant"}
      onValueChange={onValueChange}
      className="flex flex-row gap-5"
      items={items}
    />
  );
};
