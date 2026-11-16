"use client";
import type { InputMode } from "lyrics-typing-engine";
import { useTranslations } from "next-intl";
import { useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { CardHeader } from "@/ui/card";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";

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
  const t = useTranslations("typing.lineResult");
  const map = useBuiltMapState();

  const inputModeText = lineInputMode === "roma" ? t("modeRoma") : t("modeKana");

  return (
    <CardHeader className="flex flex-row items-center">
      <span>
        {lineIndex}/{map?.typingLineIndexes.length}
      </span>
      <span className="mx-2">|</span>
      <TooltipWrapper label={t("kpmTooltip", { mode: inputModeText })} asChild>
        <span className={cn("line-kpm font-bold hover:bg-border/20")}>
          {lineKpm.toFixed(0)}kpm {lineSpeed > 1 && t("speed", { speed: lineSpeed.toFixed(2) })}
        </span>
      </TooltipWrapper>
      <span className="mx-2">|</span>
      <TooltipWrapper label={t("notesTooltip", { mode: inputModeText })} asChild>
        <span className={cn("line-notes hover:bg-border/20")}>{t("notes", { count: lineNotes })}</span>
      </TooltipWrapper>
    </CardHeader>
  );
};
