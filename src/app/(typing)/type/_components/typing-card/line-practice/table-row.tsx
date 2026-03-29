"use client";
import type { RefObject } from "react";
import { useLineResultState } from "@/app/(typing)/type/_lib/atoms/family";
import { useBuiltMapState, useMediaSpeedState, useSceneState } from "@/app/(typing)/type/_lib/atoms/state";
import { CHAR_POINT } from "@/app/(typing)/type/_lib/const";
import { TableCell, TableRow } from "@/components/ui/table/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import type { BuiltMapLineWithOption } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PracticeLineTableRowProps {
  count: number;
  lineIndex: number;
  itemsRef: RefObject<HTMLElement[]>;
  onClick: (lineNumber: number) => void;
  lineData: BuiltMapLineWithOption;
}

export const PracticeLineTableRow = ({ count, lineIndex, itemsRef, onClick, lineData }: PracticeLineTableRowProps) => {
  const _lineResult = useLineResultState(count);

  const map = useBuiltMapState();
  const scene = useSceneState();
  const playSpeed = useMediaSpeedState();
  const currentLine = map?.lines[count];

  if (!currentLine || !_lineResult) return null;

  const { isSelected, lineResult } = _lineResult;

  const seekTime = currentLine.time - (scene === "replay" ? 0 : 1 * playSpeed);
  const lineKanaWord = lineData.wordChunks.map((chunk) => chunk.kana).join("");
  const point = lineResult.status.point ?? 0;
  const tBonus = lineResult.status.timeBonus ?? 0;
  const kpm = lineResult.status.kpm ?? 0;
  const rkpm = lineResult.status.rkpm ?? 0;
  const miss = lineResult.status.missCount ?? 0;
  const lost = lineResult.status.lostCount ?? 0;
  const maxLinePoint = lineData.notes.roma * CHAR_POINT;

  return (
    <TooltipWrapper
      label={
        <TableRowTooltipContent
          kpm={kpm}
          rkpm={rkpm}
          miss={miss}
          lost={lost}
          point={point}
          tBonus={tBonus}
          maxLinePoint={maxLinePoint}
        />
      }
      side="top"
      align="start"
      delayDuration={500}
      asChild
    >
      <TableRow
        ref={(el) => {
          if (el) itemsRef.current[lineIndex] = el;
        }}
        data-seek-time={seekTime}
        data-line-index={lineIndex}
        data-count={count}
        className={cn(
          "h-9 cursor-pointer select-none",
          "data-[pointer-near=true]:bg-muted/50 data-[pointer-near=true]:outline-2 data-[pointer-near=true]:outline-foreground",
          isSelected && "bg-primary/10 outline-primary",
        )}
        onClick={() => onClick(lineIndex)}
      >
        <TableCell className="text-xs">
          <TypedHiraganaResult
            hiragana={lineResult.status.typedHiragana ?? ""}
            lostHiragana={lineResult.status.lostHiragana ?? ""}
            kanaLyrics={lineKanaWord}
          />
        </TableCell>
      </TableRow>
    </TooltipWrapper>
  );
};

interface TableRowTooltipContentProps {
  kpm: number;
  rkpm: number;
  miss: number;
  lost: number;
  point: number;
  tBonus: number;
  maxLinePoint: number;
}

const TableRowTooltipContent = ({
  kpm,
  rkpm,
  miss,
  lost,
  point,
  tBonus,
  maxLinePoint,
}: TableRowTooltipContentProps) => {
  return (
    <div className="space-y-1">
      <div className="text-[11px]">
        KPM: {kpm} / RKPM: {rkpm}
      </div>
      <div className="text-[11px]">
        ミス: {miss} / ロスト: {lost}
      </div>
      <div className="text-[11px]">
        ポイント: {point}
        {tBonus ? `+${tBonus}` : ""} / {maxLinePoint}
      </div>
    </div>
  );
};

const TypedHiraganaResult = ({
  hiragana,
  lostHiragana,
  kanaLyrics,
}: {
  hiragana: string;
  lostHiragana: string;
  kanaLyrics: string;
}) => {
  return (
    <div className={cn("word-font word-outline-text break-all text-foreground uppercase")}>
      <span
        className={cn(
          "typed break-all hover:bg-border/45",
          lostHiragana === "" ? "text-word-completed" : "text-word-correct",
        )}
      >
        {hiragana.replace(/ /g, "ˍ")}
      </span>
      <span className="break-all text-word-word">{hiragana.length === 0 ? kanaLyrics : lostHiragana}</span>
    </div>
  );
};
