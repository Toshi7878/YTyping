"use client";

import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";

export function PPRankingInfoTrigger({ className }: { className?: string }) {
  const t = useTranslations("rankings.performance");
  const ppExplanation = (
    <div className="space-y-2 text-left leading-relaxed">
      <p>{t("info")}</p>
    </div>
  );

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
        aria-label="About Performance Points (PP)"
      >
        <CircleHelp className="size-5" aria-hidden />
      </button>
    </TooltipWrapper>
  );
}
