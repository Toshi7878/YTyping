"use client";
import type { RefObject } from "react";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer-atoms";
import {
  useLineResultState,
  useMapState,
  usePlayingInputModeState,
  useSceneState,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import type { LineData } from "@/app/(typing)/type/_lib/type";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CHAR_POINT } from "@/lib/build-map/build-map";
import { cn } from "@/lib/utils";
import { ResultCardContent } from "./child/result-card-body";
import { ResultCardFooter } from "./child/result-card-footer";
import { ResultCardHeader } from "./child/result-card-header";

interface OptimizedResultCardProps {
  count: number;
  lineIndex: number;
  scoreCount: number;
  cardRefs: RefObject<HTMLDivElement[]>;
  handleCardClick: (lineNumber: number) => void;
  lineData: LineData;
}

export const OptimizedResultCard = ({
  count,
  lineIndex,
  scoreCount,
  cardRefs,
  handleCardClick,
  lineData,
}: OptimizedResultCardProps) => {
  const _lineResult = useLineResultState(count);

  const map = useMapState();
  const scene = useSceneState();
  const { minPlaySpeed, playSpeed } = usePlaySpeedState();
  const inputMode = usePlayingInputModeState();

  if (!map || !_lineResult) return null;

  const { isSelected, lineResult } = _lineResult;

  const lineSpeed = lineResult.status.sp > minPlaySpeed ? lineResult.status.sp : minPlaySpeed;
  const lineInputMode = lineResult.status.mode ?? inputMode;
  const lineKanaWord = lineData.word.map((w) => w.k).join("");
  const lineTypeWord = lineInputMode === "roma" ? lineData.word.map((w) => w.r[0]).join("") : lineKanaWord;
  const lineNotes = lineInputMode === "roma" ? lineData.notes.r : lineData.notes.k;
  const lineKpm = (lineInputMode === "roma" ? lineData.kpm.r : lineData.kpm.k) * lineSpeed;

  const maxLinePoint = lineData.notes.r * CHAR_POINT;

  const kpm = lineResult.status.lKpm ?? 0;
  const rkpm = lineResult.status.lRkpm ?? 0;
  const point = lineResult.status.p ?? 0;
  const miss = lineResult.status.lMiss ?? 0;
  const tBonus = lineResult.status?.tBonus ?? 0;
  const lostWord = lineResult.status.lostW ?? "";
  const lost = lineResult.status.lLost ?? 0;

  const seekTime = Number(map.mapData[count].time) - (scene === "replay" ? 0 : 1 * playSpeed);

  return (
    <Card
      ref={(el) => {
        if (el) cardRefs.current[lineIndex] = el;
      }}
      data-seek-time={seekTime}
      data-line-index={lineIndex}
      data-count={count}
      className={cn(
        "mb-4 cursor-pointer gap-1 py-4 pl-1 shadow-lg select-none",
        "bg-card text-card-foreground border-card-foreground",
        "hover:outline-foreground hover:outline-2",
        isSelected && "outline-primary outline-2",
      )}
      onClick={() => handleCardClick(lineIndex)}
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
      <CardFooter className="py-0 text-lg font-semibold">
        <ResultCardFooter
          scoreCount={scoreCount}
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
