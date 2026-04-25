"use client";

import { CircleHelp } from "lucide-react";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ppExplanationBody = [
  "PPはプレイ実力を表すポイントです。 難しい譜面で高記録を出すほど、より多くのPPを獲得できます。合計PPは、獲得PPの高い譜面上位200件をもとに加重方式で計算されます。",
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
