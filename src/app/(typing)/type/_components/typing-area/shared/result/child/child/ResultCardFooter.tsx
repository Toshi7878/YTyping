"use client";

import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface ResultCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  scoreCount?: number;
  point: number;
  tBonus: number;
  maxLinePoint: number;
  miss: number;
  kpm: number;
  rkpm: number;
  lost: number;
  flexDirection?: "row" | "column";
  alignItems?: "flex-start" | "flex-end" | "center";
}

function ResultCardFooter({
  scoreCount,
  point,
  tBonus,
  maxLinePoint,
  miss,
  kpm,
  rkpm,
  lost,
  flexDirection = "row",
  alignItems = "center",
  className,
  ...props
}: ResultCardFooterProps) {
  const missColor = point === 0 ? "gray" : miss > 0 || lost > 0 ? "red" : "green";

  return (
    <div
      className={cn(
        "flex gap-2 w-full justify-between py-2",
        flexDirection === "column" && "flex-col",
        alignItems === "flex-start" && "items-start",
        alignItems === "flex-end" && "items-end",
        alignItems === "center" && "items-center",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Badge
          variant={missColor === "gray" ? "outline" : missColor === "red" ? "destructive" : "default"}
          className="text-sm px-1.5 py-0.5"
        >
          ミス: {miss}, ロスト: {lost}
        </Badge>
        <TooltipWrapper label={`rkpm: ${rkpm}`} >
          <Badge variant="secondary" className="text-sm px-1.5 py-0.5">
            KPM: {kpm}
          </Badge>
        </TooltipWrapper>
      </div>

      <TooltipWrapper
        label={`合計ポイント: ${Number(point) + Number(tBonus)}${scoreCount ? ` スコア: ${scoreCount}` : ""}`}
      >
        <Badge variant="default" className="text-sm px-2 py-1 rounded-md">
          ポイント: {point}
          {tBonus ? `+${tBonus}` : ""}
        </Badge>
      </TooltipWrapper>
    </div>
  );
}

export default memo(ResultCardFooter);
