"use client";
import { usePlaySpeedState } from "@/app/type/atoms/speedReducerAtoms";
import { useMapState, usePlayingInputModeState, useSceneState } from "@/app/type/atoms/stateAtoms";
import { LineData, LineResultData } from "@/app/type/ts/type";
import { CHAR_POINT } from "@/lib/parseMap";
import { ThemeColors } from "@/types";
import { Card, CardBody, CardFooter, CardHeader, Divider, useTheme } from "@chakra-ui/react";
import { memo } from "react";
import ResultCardBody from "./child/ResultCardBody";
import ResultCardFooter from "./child/ResultCardFooter";
import ResultCardHeader from "./child/ResultCardHeader";

interface ResultCardProps {
  lineResult: LineResultData;
  index: number;
  lineCount: number;
  scoreCount: number;
  lineData: LineData;
  cardRefs: React.RefObject<HTMLDivElement[]>;
  selectIndex: number;
  handleCardClick: (lineNumber: number) => void;
}

function ResultCard({
  lineResult,
  index,
  lineCount,
  scoreCount,
  lineData,
  selectIndex,
  cardRefs,
  handleCardClick,
}: ResultCardProps) {
  const map = useMapState();
  const scene = useSceneState();
  const theme: ThemeColors = useTheme();
  const speedData = usePlaySpeedState();
  const inputMode = usePlayingInputModeState();

  const lineSpeed = lineResult.status.sp > speedData.defaultSpeed ? lineResult.status.sp : speedData.defaultSpeed;
  const lineInputMode = lineResult.status.mode ?? inputMode;
  const lineKanaWord = lineData.word.map((w) => w["k"]).join("");
  const lineTypeWord = lineInputMode === "roma" ? lineData.word.map((w) => w["r"][0]).join("") : lineKanaWord;
  const lineNotes = lineInputMode === "roma" ? lineData.notes.r : lineData.notes.k;
  const lineTime = (Number(map.mapData[index + 1].time) - (index === 0 ? 0 : Number(lineData.time))) / lineSpeed;
  const lineKpm = (lineInputMode === "roma" ? lineData.kpm.r : lineData.kpm.k) * lineSpeed;

  const maxLinePoint = lineData.notes.r * CHAR_POINT;

  const kpm = lineResult.status.lKpm;
  const rkpm = lineResult.status.lRkpm;
  const point = lineResult.status.p;
  const lMiss = lineResult.status.lMiss;
  const tBonus = lineResult.status.tBonus;
  const lostWord = lineResult.status.lostW;

  const seekTime = Number(map.mapData[index]["time"]) - (scene === "replay" ? 0 : 1 * speedData.playSpeed);

  const lineNumber = lineCount;

  return (
    <Card
      key={index}
      ref={(el) => {
        if (el) cardRefs.current![lineCount] = el;
      }}
      variant="practice"
      data-seek-time={seekTime}
      data-line-number={lineNumber}
      data-count={index}
      style={{
        ...(selectIndex === lineNumber && {
          outline: `3px solid ${theme.colors.primary.main}`,
        }),
      }}
      onClick={() => handleCardClick(lineNumber)}
    >
      <CardHeader py={0}>
        <ResultCardHeader
          index={index}
          lineCount={lineCount}
          lineNotes={lineNotes}
          lineInputMode={lineInputMode}
          lineTime={lineTime}
          lineKpm={lineKpm}
          lineSpeed={lineSpeed}
        />
      </CardHeader>
      <CardBody py={0} fontSize="md" className="word-font">
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
          lMiss={lMiss!}
          kpm={kpm!}
          rkpm={rkpm!}
          flexDirection="column"
        />
      </CardFooter>
    </Card>
  );
}

export default memo(ResultCard);
