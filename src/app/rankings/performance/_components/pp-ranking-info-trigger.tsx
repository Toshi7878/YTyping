"use client";

import { CircleHelp } from "lucide-react";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ppExplanationBody = [
  "PP（Performance Points）は、各譜面のプレイ結果から算出されるポイントです。譜面の難易度に加え、正確率・打ち切り率・再生速度から、譜面ごとの PP が決まります。",
  "ランキングの「合計 PP」は、これまでの全プレイの PP を高い順に並べ、上位ほど重みが大きくなる加重合計で求めた値です。",
] as const;

const ppExplanation = (
  <div className="space-y-2 text-left leading-relaxed">
    {ppExplanationBody.map((text) => (
      <p key={text}>{text}</p>
    ))}
  </div>
);

export function PPRankingInfoTrigger({ className }: { className?: string }) {
  return (
    <TooltipWrapper
      label={ppExplanation}
      side="bottom"
      align="start"
      className="max-w-sm px-3 py-2"
      delayDuration={200}
      asChild
    >
      <button
        type="button"
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        aria-label="パフォーマンスポイント（PP）について"
      >
        <CircleHelp className="size-5" aria-hidden />
      </button>
    </TooltipWrapper>
  );
}
