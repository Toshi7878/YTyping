"use client";
import type { InputMode } from "lyrics-typing-engine";
import { useBuiltMapState } from "@/app/(typing)/type/_lib/atoms/state";
import { CardHeader } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ResultCardHeaderProps {
  lineNotes: number;
  lineIndex: number;
  lineInputMode: InputMode;
  lineKpm: number;
  lineSpeed: number;
}

export const ResultCardHeader = ({
  lineNotes,
  lineIndex,
  lineInputMode,
  lineKpm,
  lineSpeed,
}: ResultCardHeaderProps) => {
  const map = useBuiltMapState();

  const inputModeText = lineInputMode === "roma" ? "(ローマ字)" : "(かな)";

  return (
    <CardHeader className="flex flex-row items-center">
      <span>
        {lineIndex}/{map?.typingLineIndexes.length}
      </span>
      <span className="mx-2">|</span>
      <TooltipWrapper label={`要求打鍵速度${inputModeText}`} asChild>
        <span className={cn("line-kpm font-bold hover:bg-border/20")}>
          {lineKpm.toFixed(0)}kpm {lineSpeed > 1 && `(${lineSpeed.toFixed(2)}倍速)`}
        </span>
      </TooltipWrapper>
      <span className="mx-2">|</span>
      <TooltipWrapper label={`要求打鍵数${inputModeText}`} asChild>
        <span className={cn("line-notes hover:bg-border/20")}>{lineNotes}打</span>
      </TooltipWrapper>
    </CardHeader>
  );
};
