"use client";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import {
  useLineResultState,
  useMapState,
  usePlayingInputModeState,
  useSceneState,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import type { LineData } from "@/app/(typing)/type/_lib/type";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { BuildMap } from "@/utils/build-map/buildMap";
import { CHAR_POINT } from "@/utils/build-map/buildMap";
import type { RefObject } from "react";
import ResultCardContent from "./child/ResultCardBody";
import ResultCardFooter from "./child/ResultCardFooter";
import ResultCardHeader from "./child/ResultCardHeader";

interface OptimizedResultCardProps {
  count: number;
  lineIndex: number;
  scoreCount: number;
  cardRefs: RefObject<HTMLDivElement[]>;
  handleCardClick: (lineNumber: number) => void;
  lineData: LineData;
}

function OptimizedResultCard({
  count,
  lineIndex,
  scoreCount,
  cardRefs,
  handleCardClick,
  lineData,
}: OptimizedResultCardProps) {
  const _lineResult = useLineResultState(count);
  if (!_lineResult) return;

  const { isSelected, lineResult } = _lineResult;
  const map = useMapState() as BuildMap;
  const scene = useSceneState();
  const { minPlaySpeed, playSpeed } = usePlaySpeedState();
  const inputMode = usePlayingInputModeState();

  const lineSpeed = lineResult.status.sp > minPlaySpeed ? lineResult.status.sp : minPlaySpeed;
  const lineInputMode = lineResult.status.mode ?? inputMode;
  const lineKanaWord = lineData.word.map((w) => w["k"]).join("");
  const lineTypeWord = lineInputMode === "roma" ? lineData.word.map((w) => w["r"][0]).join("") : lineKanaWord;
  const lineNotes = lineInputMode === "roma" ? lineData.notes.r : lineData.notes.k;
  const lineKpm = (lineInputMode === "roma" ? lineData.kpm.r : lineData.kpm.k) * lineSpeed;

  const maxLinePoint = lineData.notes.r * CHAR_POINT;

  const kpm = lineResult.status.lKpm;
  const rkpm = lineResult.status.lRkpm;
  const point = lineResult.status.p;
  const miss = lineResult.status.lMiss;
  const tBonus = lineResult.status.tBonus;
  const lostWord = lineResult.status.lostW;
  const lost = lineResult.status.lLost;

  const seekTime = Number(map.mapData[count]["time"]) - (scene === "replay" ? 0 : 1 * playSpeed);

  return (
    <Card
      ref={(el) => {
        if (el) cardRefs.current![lineIndex] = el;
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
        lostWord={lostWord!}
      />

      <Separator className="mx-auto w-[88%]" />
      <CardFooter className="py-0 text-lg font-semibold">
        <ResultCardFooter
          scoreCount={scoreCount}
          point={point!}
          tBonus={tBonus!}
          maxLinePoint={maxLinePoint}
          miss={miss!}
          kpm={kpm!}
          rkpm={rkpm!}
          lost={lost!}
          className="flex-col"
        />
      </CardFooter>
    </Card>
  );
}

export default OptimizedResultCard;
