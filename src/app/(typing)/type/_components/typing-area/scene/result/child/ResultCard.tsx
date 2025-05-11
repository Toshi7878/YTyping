"use client";
import { usePlaySpeedState } from "@/app/(typing)/type/atoms/speedReducerAtoms";
import { useMapState, usePlayingInputModeState, useSceneState } from "@/app/(typing)/type/atoms/stateAtoms";
import { LineData, LineResultData } from "@/app/(typing)/type/ts/type";
import { ThemeColors } from "@/types";
import { CHAR_POINT, ParseMap } from "@/util/parse-map/parseMap";
import { Card, CardBody, CardFooter, CardHeader, Divider, useTheme } from "@chakra-ui/react";
import { memo } from "react";
import ResultCardBody from "./child/ResultCardBody";
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
  const theme: ThemeColors = useTheme();
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

  return (
    <Card
      ref={(el) => {
        if (el) cardRefs.current![lineIndex] = el;
      }}
      variant="practice"
      data-seek-time={seekTime}
      data-line-index={lineIndex}
      data-count={count}
      style={{
        ...(selectIndex === lineIndex && {
          outline: `3px solid ${theme.colors.primary.main}`,
        }),
      }}
      onClick={() => handleCardClick(lineIndex)}
    >
      <CardHeader py={0}>
        <ResultCardHeader
          lineIndex={lineIndex}
          lineNotes={lineNotes}
          lineInputMode={lineInputMode}
          lineKpm={lineKpm}
          lineSpeed={lineSpeed}
        />
      </CardHeader>
      <CardBody py={2} fontSize="md" className="word-font">
        <ResultCardBody
          lineKanaWord={lineKanaWord}
          typeResult={lineResult.typeResult}
          lineTypeWord={lineTypeWord}
          lostWord={lostWord!}
        />
      </CardBody>
      <Divider width="88%" mx="auto" />
      <CardFooter py={0} fontSize="lg" fontWeight="semibold">
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

export default memo(ResultCard);
