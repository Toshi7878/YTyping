import { usePlaySpeedState } from "@/app/type/atoms/speedReducerAtoms";
import {
  useLineResultsState,
  useLineSelectIndexState,
  useMapState,
  usePlayingInputModeState,
} from "@/app/type/atoms/stateAtoms";
import { useMoveLine } from "@/app/type/hooks/playing-hooks/useMoveLine";
import { useInteractJS } from "@/app/type/hooks/useInteractJS";
import { CHAR_POINT } from "@/lib/instanceMapData";
import { ThemeColors } from "@/types";
import { Card, CardBody, CardFooter, CardHeader, useTheme } from "@chakra-ui/react";
import { useState } from "react";
import ResultCardBody from "../result/child/child/ResultCardBody";
import ResultCardFooter from "../result/child/child/ResultCardFooter";
import ResultCardHeader from "../result/child/child/ResultCardHeader";

const PracticeLineCard = () => {
  const map = useMapState();
  const lineResults = useLineResultsState();
  const speedData = usePlaySpeedState();
  const lineSelectIndex = useLineSelectIndexState();
  const inputMode = usePlayingInputModeState();
  const theme: ThemeColors = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const { moveSetLine } = useMoveLine();
  const interact = useInteractJS();

  const index = map.typingLineNumbers[lineSelectIndex - 1] || map.typingLineNumbers[0];

  const lineResult = lineResults[index];

  const lineInputMode = lineResult.status.mode ?? inputMode;

  const lineData = map.mapData[index];

  const maxLinePoint = lineData.notes.r * CHAR_POINT;
  const lineKanaWord = lineData.word.map((w) => w["k"]).join("");
  const lineNotes = lineInputMode === "roma" ? lineData.notes.r : lineData.notes.k;
  const lineSpeed =
    lineResult?.status!.sp > speedData.defaultSpeed ? lineResult?.status!.sp : speedData.defaultSpeed;
  const lineTime =
    (Number(map.mapData[index + 1].time) - (index === 0 ? 0 : Number(lineData.time))) / lineSpeed;
  const lineKpm = (lineInputMode === "roma" ? lineData.kpm.r : lineData.kpm.k) * lineSpeed;

  //ユーザーのLineリザルトデータ
  const lineTypeWord = lineInputMode === "roma" ? lineData.word.map((w) => w["r"][0]).join("") : lineKanaWord;
  const lostWord = lineResult.status.lostW;
  const point = lineResult.status.p;
  const tBonus = lineResult.status.tBonus;
  const kpm = lineResult.status.lKpm;
  const rkpm = lineResult.status.lRkpm;
  const lMiss = lineResult.status.lMiss;

  return (
    <Card
      ref={interact?.ref}
      py={4}
      pl={1}
      mb={4}
      gap={1}
      zIndex={100}
      style={{
        ...interact?.style,
        height: "fit-content",
      }}
      bg={theme.colors.background.card}
      color={theme.colors.text.body}
      outline={`1px solid ${theme.colors.border.card}`}
      boxShadow="lg"
      _hover={{
        bg: theme.colors.button.sub,
      }}
      cursor={isDragging ? "move" : "pointer"}
      onMouseDown={() => setIsDragging(false)}
      onMouseMove={() => setIsDragging(true)}
      onClick={() => {
        if (!isDragging) {
          const seekCount = map.typingLineNumbers[lineSelectIndex - 1];
          moveSetLine(seekCount);
        }
      }}
    >
      <CardHeader py={0}>
        <ResultCardHeader
          index={index}
          lineCount={lineSelectIndex}
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
      <CardFooter py={0} ml={1} fontWeight="semibold" fontSize="lg">
        <ResultCardFooter
          point={point!}
          tBonus={tBonus!}
          maxLinePoint={maxLinePoint}
          lMiss={lMiss!}
          kpm={kpm!}
          rkpm={rkpm!}
        />
      </CardFooter>
    </Card>
  );
};

export default PracticeLineCard;
