"use client";
import { setTypingOptions, useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { CounterInput } from "@/components/ui/counter";
import { LabeledRadioGroup } from "@/components/ui/radio-group/labeled-radio-group";
import { H4 } from "@/components/ui/typography";

const MAX_SCROLL = 80;
const MIN_SCROLL = 5;
const SCROLL_STEP = 5;

export const WordScrollFields = () => {
  const { mainWordScrollStart, subWordScrollStart } = useTypingOptionsState();

  return (
    <section className="flex flex-col gap-4">
      <H4>ワードスクロール設定</H4>
      <div className="flex gap-6">
        <CounterInput
          onChange={(value) => setTypingOptions({ mainWordScrollStart: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={mainWordScrollStart}
          label="メイン開始位置"
          decrementTooltip="メインワードスクロール開始位置を左に移動します"
          incrementTooltip="メインワードスクロール開始位置を右に移動します"
        />
        <CounterInput
          onChange={(value) => setTypingOptions({ subWordScrollStart: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={subWordScrollStart}
          label="サブ開始位置"
          decrementTooltip="サブワードスクロール開始位置を左に移動します"
          incrementTooltip="サブワードスクロール開始位置を右に移動します"
        />
      </div>
      <WordScrollAnimationRadioOptions />
    </section>
  );
};

const WordScrollAnimationRadioOptions = () => {
  const { isSmoothScroll } = useTypingOptionsState();

  const items = [
    { label: "アニメーションあり", value: "smooth" },
    { label: "アニメーションなし", value: "instant" },
  ];

  return (
    <LabeledRadioGroup
      label="スクロールアニメーション"
      value={isSmoothScroll ? "smooth" : "instant"}
      onValueChange={(value: "smooth" | "instant") => {
        setTypingOptions({ isSmoothScroll: value === "smooth" });
      }}
      className="flex flex-row gap-5"
      items={items}
    />
  );
};
