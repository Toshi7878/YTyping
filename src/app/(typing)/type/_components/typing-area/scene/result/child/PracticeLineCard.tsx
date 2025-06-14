import { usePlaySpeedState } from "@/app/(typing)/type/atoms/speedReducerAtoms";
import {
  useLineResultsState,
  useLineSelectIndexState,
  useMapState,
  usePlayingInputModeState,
} from "@/app/(typing)/type/atoms/stateAtoms";
import { useMoveLine } from "@/app/(typing)/type/hooks/playing-hooks/moveLine";
import { useInteractJS } from "@/app/(typing)/type/hooks/useInteractJS";
import { CHAR_POINT, ParseMap } from "@/utils/parse-map/parseMap";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import ResultCardBody from "./child/ResultCardBody";
import ResultCardFooter from "./child/ResultCardFooter";
import ResultCardHeader from "./child/ResultCardHeader";

const PracticeLineCard = () => {
  const map = useMapState() as ParseMap;
  const lineResults = useLineResultsState();
  const speedData = usePlaySpeedState();
  const lineSelectIndex = useLineSelectIndexState();
  const inputMode = usePlayingInputModeState();
  const [isDragging, setIsDragging] = useState(false);
  const { moveSetLine } = useMoveLine();
  const interact = useInteractJS();

  const index = map.typingLineIndexes[lineSelectIndex - 1] || map.typingLineIndexes[0];

  const lineResult = lineResults[index];

  const lineInputMode = lineResult.status.mode ?? inputMode;

  const lineData = map.mapData[index];

  const maxLinePoint = lineData.notes.r * CHAR_POINT;
  const lineKanaWord = lineData.word.map((w) => w["k"]).join("");
  const lineNotes = lineInputMode === "roma" ? lineData.notes.r : lineData.notes.k;
  const lineSpeed = lineResult?.status!.sp > speedData.defaultSpeed ? lineResult?.status!.sp : speedData.defaultSpeed;
  const lineKpm = (lineInputMode === "roma" ? lineData.kpm.r : lineData.kpm.k) * lineSpeed;

  //ユーザーのLineリザルトデータ
  const lineTypeWord = lineInputMode === "roma" ? lineData.word.map((w) => w["r"][0]).join("") : lineKanaWord;
  const lostWord = lineResult.status.lostW;
  const point = lineResult.status.p;
  const tBonus = lineResult.status.tBonus;
  const kpm = lineResult.status.lKpm;
  const rkpm = lineResult.status.lRkpm;
  const miss = lineResult.status.lMiss;
  const lost = lineResult.status.lLost;

  return (
    <Card
      ref={interact?.ref}
      className="practice-card border"
      style={{
        ...interact?.style,
        height: "fit-content",
        cursor: isDragging ? "move" : "pointer"
      }}
      onMouseDown={() => setIsDragging(false)}
      onMouseMove={() => setIsDragging(true)}
      onClick={() => {
        if (!isDragging) {
          const seekCount = map.typingLineIndexes[lineSelectIndex - 1];
          moveSetLine(seekCount);
        }
      }}
    >
      <CardHeader>
        <ResultCardHeader
          lineIndex={lineSelectIndex}
          lineNotes={lineNotes}
          lineInputMode={lineInputMode}
          lineKpm={lineKpm}
          lineSpeed={lineSpeed}
        />
      </CardHeader>
      <CardContent className="word-font py-2">
        <ResultCardBody
          lineKanaWord={lineKanaWord}
          typeResult={lineResult.typeResult}
          lineTypeWord={lineTypeWord}
          lostWord={lostWord!}
        />
      </CardContent>
      <Separator className="w-[92%] mx-auto" />
      <CardFooter>
        <ResultCardFooter
          point={point!}
          tBonus={tBonus!}
          maxLinePoint={maxLinePoint}
          miss={miss!}
          lost={lost!}
          kpm={kpm!}
          rkpm={rkpm!}
          alignItems="flex-end"
        />
      </CardFooter>
    </Card>
  );
};

export default PracticeLineCard;
