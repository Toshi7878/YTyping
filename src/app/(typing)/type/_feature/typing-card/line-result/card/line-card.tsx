"use client";
import type { RefObject } from "react";
import { useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { useLineResultState } from "@/app/(typing)/type/_feature/atoms/line-result";
import { CHAR_POINT } from "@/app/(typing)/type/_feature/lib/const";
import type { BuiltMapLineWithOption } from "@/domain/map/built-map-helper";
import { cn } from "@/lib/tailwind";
import { Card, CardFooter } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { usePlayingInputModeState } from "../../../atoms/typing-word";
import { useMediaSpeedState } from "../../../youtube/youtube-player";
import { useSceneState } from "../../typing-card";
import { ResultCardContent } from "./card-body";
import { ResultCardFooter } from "./card-footer";
import { ResultCardHeader } from "./card-header";

interface OptimizedResultCardProps {
  count: number;
  lineIndex: number;
  itemsRef: RefObject<HTMLDivElement[]>;
  onClick: (lineNumber: number) => void;
  lineData: BuiltMapLineWithOption;
}

export const OptimizedResultCard = ({ count, lineIndex, itemsRef, onClick, lineData }: OptimizedResultCardProps) => {
  const _lineResult = useLineResultState(count);

  const map = useBuiltMapState();
  const scene = useSceneState();
  const playSpeed = useMediaSpeedState();
  const inputMode = usePlayingInputModeState();
  const currentLine = map?.lines[count];

  if (!currentLine || !_lineResult) return null;

  const { isSelected, lineResult } = _lineResult;

  const lineSpeed = lineResult.status.speed;
  const lineInputMode = lineResult.status.mode ?? inputMode;
  const lineKanaWord = lineData.wordChunks.map((chunk) => chunk.kana).join("");
  const lineTypeWord =
    lineInputMode === "roma" ? lineData.wordChunks.map((chunk) => chunk.romaPatterns[0]).join("") : lineKanaWord;
  const lineNotes = lineInputMode === "roma" ? lineData.notes.roma : lineData.notes.kana;
  const lineKpm = (lineInputMode === "roma" ? lineData.kpm.roma : lineData.kpm.kana) * lineSpeed;

  const maxLinePoint = lineData.notes.roma * CHAR_POINT;

  const kpm = lineResult.status.kpm ?? 0;
  const rkpm = lineResult.status.rkpm ?? 0;
  const point = lineResult.status.point ?? 0;
  const miss = lineResult.status.missCount ?? 0;
  const tBonus = lineResult.status?.timeBonus ?? 0;
  const lostWord = lineResult.status.lostWord ?? "";
  const lost = lineResult.status.lostCount ?? 0;

  const seekTime = currentLine.time - (scene === "replay" ? 0 : 1 * playSpeed);

  return (
    <Card
      ref={(el) => {
        if (el) itemsRef.current[lineIndex] = el;
      }}
      data-seek-time={seekTime}
      data-line-index={lineIndex}
      data-count={count}
      className={cn(
        "mb-4 cursor-pointer select-none gap-1 py-4 shadow-lg",
        "hover:outline-2 hover:outline-foreground",
        isSelected && "outline-2 outline-primary",
      )}
      onClick={() => onClick(lineIndex)}
    >
      <ResultCardHeader
        lineIndex={lineIndex}
        lineNotes={lineNotes}
        lineInputMode={lineInputMode}
        lineKpm={lineKpm}
        lineSpeed={lineSpeed}
      />

      <ResultCardContent
        lineKanaWord={lineKanaWord}
        types={lineResult.types}
        lineTypeWord={lineTypeWord}
        lostWord={lostWord}
      />

      <Separator className="mx-auto w-[88%]" />
      <CardFooter className="py-0 font-semibold text-lg">
        <ResultCardFooter
          point={point}
          tBonus={tBonus}
          maxLinePoint={maxLinePoint}
          miss={miss}
          kpm={kpm}
          rkpm={rkpm}
          lost={lost}
          className="flex-col"
        />
      </CardFooter>
    </Card>
  );
};
