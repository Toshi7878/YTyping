"use client";

import { CircleHelp } from "lucide-react";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ppExplanationBody = [
  "PP（Performance Points）は、譜面ごとに保存されているプレイ記録から算出されるポイントです。譜面の難易度を元に、正確率・クリア率からPPが算出され、難しい譜面で正確率・クリア率が良い記録を登録すると、より多くのPPが得られます。",
  "「合計 PP」は、全譜面の PP を高い順に並べ、上位の値ほど寄与が大きく、順位が下がるほど寄与が弱くなる加重合計で計算されます。",
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
