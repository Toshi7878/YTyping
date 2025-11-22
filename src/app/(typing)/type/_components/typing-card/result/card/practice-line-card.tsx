import { useState } from "react";
import { useLineResultState } from "@/app/(typing)/type/_lib/atoms/family";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import {
  useBuiltMapState,
  useLineSelectIndexState,
  usePlayingInputModeState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { CHAR_POINT } from "@/app/(typing)/type/_lib/const";
import { moveSetLine } from "@/app/(typing)/type/_lib/playing/move-line";
import { useInteractJS } from "@/app/(typing)/type/_lib/utils/use-interact-js";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResultCardContent } from "./child/result-card-body";
import { ResultCardFooter } from "./child/result-card-footer";
import { ResultCardHeader } from "./child/result-card-header";

export const PracticeLineCard = () => {
  const map = useBuiltMapState();
  const speedData = usePlaySpeedState();
  const lineSelectIndex = useLineSelectIndexState();
  const inputMode = usePlayingInputModeState();
  const [isDragging, setIsDragging] = useState(false);
  const interact = useInteractJS();

  const index = map?.typingLineIndexes[lineSelectIndex - 1] ?? map?.typingLineIndexes[0] ?? 0;

  const _lineResult = useLineResultState(index);
  if (!_lineResult) return null;
  const { lineResult } = _lineResult;

  const lineInputMode = lineResult.status.mode ?? inputMode;

  const builtLine = map?.lines[index];
  if (!builtLine) return null;

  const maxLinePoint = builtLine.notes.roma * CHAR_POINT;
  const lineKanaWord = builtLine.word.map((w) => w.kana).join("");
  const lineNotes = lineInputMode === "roma" ? builtLine.notes.roma : builtLine.notes.kana;
  const lineSpeed = lineResult.status.sp > speedData.minPlaySpeed ? lineResult.status.sp : speedData.minPlaySpeed;
  const lineKpm = (lineInputMode === "roma" ? builtLine.kpm.roma : builtLine.kpm.kana) * lineSpeed;

  const lineTypeWord = lineInputMode === "roma" ? builtLine.word.map((w) => w.romaPatterns[0]).join("") : lineKanaWord;
  const lostWord = lineResult.status.lostW ?? "";
  const point = lineResult.status.p ?? 0;
  const tBonus = lineResult.status.tBonus ?? 0;
  const kpm = lineResult.status.lKpm ?? 0;
  const rkpm = lineResult.status.lRkpm ?? 0;
  const miss = lineResult.status.lMiss ?? 0;
  const lost = lineResult.status.lLost ?? 0;

  return (
    <Card
      ref={interact.ref}
      className="practice-card z-10 block border py-2"
      style={{
        ...interact.style,
        height: "fit-content",
        cursor: isDragging ? "move" : "pointer",
      }}
      onMouseDown={() => setIsDragging(false)}
      onMouseMove={() => setIsDragging(true)}
      onClick={() => {
        const seekCount = map.typingLineIndexes[lineSelectIndex - 1];
        if (!isDragging && seekCount) {
          moveSetLine(seekCount);
        }
      }}
    >
      <ResultCardHeader
        lineIndex={lineSelectIndex}
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

      <Separator className="mx-auto w-[92%]" />
      <CardFooter>
        <ResultCardFooter
          point={point}
          tBonus={tBonus}
          maxLinePoint={maxLinePoint}
          miss={miss}
          lost={lost}
          kpm={kpm}
          rkpm={rkpm}
        />
      </CardFooter>
    </Card>
  );
};
