"use client";
import type { RefObject } from "react";
import { useLineResultState } from "@/app/(typing)/type/_lib/atoms/family";
import { useBuiltMapState, useMediaSpeedState, useSceneState } from "@/app/(typing)/type/_lib/atoms/state";
import { TableCell, TableRow } from "@/components/ui/table/table";
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
  const missCount = lineResult.status.missCount ?? 0;

  return (
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
      <TableCell className="flex items-center gap-2 text-xs">
        {missCount > 1 && (
          <span
            className={cn(
              "word-outline-text shrink-0 font-semibold text-muted-foreground tabular-nums",
              missCount > 0 && "text-destructive",
            )}
          >
            miss: <span>{missCount}</span>
          </span>
        )}

        <TypedHiraganaResult
          hiragana={lineResult.status.typedHiragana ?? ""}
          lostHiragana={lineResult.status.lostHiragana ?? ""}
          kanaLyrics={lineKanaWord}
        />
      </TableCell>
    </TableRow>
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
    <div className={cn("word-font word-outline-text break-all text-foreground")}>
      <span className={cn("typed break-all", lostHiragana === "" ? "text-word-completed" : "text-word-correct")}>
        {hiragana.replace(/ /g, "ˍ")}
      </span>
      <span className="break-all text-word-word">{hiragana.length === 0 ? kanaLyrics : lostHiragana}</span>
    </div>
  );
};
