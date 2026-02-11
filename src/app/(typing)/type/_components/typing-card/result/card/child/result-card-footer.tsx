"use client";

import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ResultCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  scoreCount?: number;
  point: number;
  tBonus: number;
  maxLinePoint: number;
  miss: number;
  kpm: number;
  rkpm: number;
  lost: number;
}

export const ResultCardFooter = ({
  scoreCount,
  point,
  tBonus,
  maxLinePoint,
  miss,
  kpm,
  rkpm,
  lost,
  className,
  ...props
}: ResultCardFooterProps) => {
  const missColor = point === 0 ? "gray" : miss > 0 || lost > 0 ? "red" : "green";

  return (
    <div className={cn("flex w-full justify-between gap-2 py-2", className)} {...props}>
      <div className="flex items-center gap-2">
        <Badge
          variant={missColor === "gray" ? "outline" : missColor === "red" ? "destructive" : "default"}
          className="px-1.5 py-0.5 text-sm"
        >
          ミス: {miss}, ロスト: {lost}
        </Badge>
        <TooltipWrapper label={`rkpm: ${rkpm}`} asChild>
          <Badge variant="secondary" className="px-1.5 py-0.5 text-sm">
            KPM: {kpm}
          </Badge>
        </TooltipWrapper>
      </div>

      <TooltipWrapper
        label={`合計ポイント: ${Number(point) + Number(tBonus)}${scoreCount ? ` スコア: ${scoreCount}` : ""}`}
        asChild
      >
        <Badge variant="default" className="rounded-md px-2 py-1 text-sm">
          ポイント: {point}
          {tBonus ? `+${tBonus}` : ""} / {maxLinePoint}
        </Badge>
      </TooltipWrapper>
    </div>
  );
};
