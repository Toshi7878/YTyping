"use client";
import { useMapState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { InputMode } from "@/app/(typing)/type/_lib/type";
import { CardHeader } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ParseMap } from "@/utils/parse-map/parseMap";

interface ResultCardHeaderProps {
  lineNotes: number;
  lineIndex: number;
  lineInputMode: InputMode;
  lineKpm: number;
  lineSpeed: number;
}

function ResultCardHeader({ lineNotes, lineIndex, lineInputMode, lineKpm, lineSpeed }: ResultCardHeaderProps) {
  const map = useMapState() as ParseMap;

  const inputModeText = lineInputMode === "roma" ? "(ローマ字)" : "(かな)";

  return (
    <CardHeader className="flex flex-row items-center">
      <span>
        {lineIndex}/{map?.lineLength}
      </span>
      <span className="mx-2">|</span>
      <TooltipWrapper label={`要求打鍵速度${inputModeText}`}>
        <span className={cn("line-kpm hover:bg-border/20 font-bold")}>
          {lineKpm.toFixed(0)}kpm {lineSpeed > 1 && `(${lineSpeed.toFixed(2)}倍速)`}
        </span>
      </TooltipWrapper>
      <span className="mx-2">|</span>
      <TooltipWrapper label={`要求打鍵数${inputModeText}`}>
        <span className={cn("line-notes hover:bg-border/20")}>{lineNotes}打</span>
      </TooltipWrapper>
    </CardHeader>
  );
}

export default ResultCardHeader;
