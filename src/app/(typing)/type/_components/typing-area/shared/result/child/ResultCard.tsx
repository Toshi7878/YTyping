"use client";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import { useMapState, usePlayingInputModeState, useSceneState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { LineData, LineResultData } from "@/app/(typing)/type/_lib/type";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CHAR_POINT, ParseMap } from "@/utils/parse-map/parseMap";
import ResultCardContent from "./child/ResultCardBody";
import ResultCardFooter from "./child/ResultCardFooter";
import ResultCardHeader from "./child/ResultCardHeader";

interface ResultCardProps {
  lineResult: LineResultData;
  count: number;
  lineIndex: number;
  scoreCount: number;
  lineData: LineData;
  cardRefs: React.RefObject<HTMLDivElement[]>;
  selectIndex: number;
  handleCardClick: (lineNumber: number) => void;
}

function ResultCard({
  lineResult,
  count,
  lineIndex,
  scoreCount,
  lineData,
  selectIndex,
  cardRefs,
  handleCardClick,
}: ResultCardProps) {
  const map = useMapState() as ParseMap;
  const scene = useSceneState();
  const speedData = usePlaySpeedState();
  const inputMode = usePlayingInputModeState();

  const lineSpeed = lineResult.status.sp > speedData.defaultSpeed ? lineResult.status.sp : speedData.defaultSpeed;
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

  const seekTime = Number(map.mapData[count]["time"]) - (scene === "replay" ? 0 : 1 * speedData.playSpeed);

  const isSelected = selectIndex === lineIndex;

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
        typeResult={lineResult.typeResult}
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
          flexDirection="column"
          alignItems="flex-start"
        />
      </CardFooter>
    </Card>
  );
}

export default ResultCard;
