import { DndContext, MouseSensor, TouchSensor, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { useState } from "react";
import { useLineResultState } from "@/app/(typing)/type/_lib/atoms/family";
import {
  useBuiltMapState,
  useLineSelectIndexState,
  usePlayingInputModeState,
} from "@/app/(typing)/type/_lib/atoms/state";

import { CHAR_POINT } from "@/app/(typing)/type/_lib/const";
import { moveSetLine } from "@/app/(typing)/type/_lib/playing/move-line";
import { Card, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ResultCardContent } from "./card-content";
import { ResultCardFooter } from "./card-footer";

const ACTIVATION_CONSTRAINT = { distance: 5 };

export const FloatingPracticeLineCard = () => {
  const [{ x, y }, setCoordinates] = useState({ x: 0, y: 0 });
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: ACTIVATION_CONSTRAINT }),
    useSensor(TouchSensor, { activationConstraint: ACTIVATION_CONSTRAINT }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ delta }) => {
        setCoordinates(({ x, y }) => ({
          x: x + delta.x,
          y: y + delta.y,
        }));
      }}
    >
      <DraggableCard x={x} y={y} />
    </DndContext>
  );
};

const DraggableCard = ({ x, y }: { x: number; y: number }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: "practice-line-card",
  });
  const map = useBuiltMapState();
  const lineSelectIndex = useLineSelectIndexState();
  const inputMode = usePlayingInputModeState();

  const index = map?.typingLineIndexes[lineSelectIndex - 1] ?? map?.typingLineIndexes[0] ?? 0;

  const _lineResult = useLineResultState(index);
  if (!_lineResult) return null;
  const { lineResult } = _lineResult;

  const lineInputMode = lineResult.status.mode ?? inputMode;

  const builtLine = map?.lines[index];
  if (!builtLine) return null;

  const maxLinePoint = builtLine.notes.roma * CHAR_POINT;
  const lineKanaWord = builtLine.wordChunks.map((chunk) => chunk.kana).join("");

  const lineTypeWord =
    lineInputMode === "roma" ? builtLine.wordChunks.map((chunk) => chunk.romaPatterns[0]).join("") : lineKanaWord;
  const lostWord = lineResult.status.lostWord ?? "";
  const point = lineResult.status.point ?? 0;
  const tBonus = lineResult.status.timeBonus ?? 0;
  const kpm = lineResult.status.kpm ?? 0;
  const rkpm = lineResult.status.rkpm ?? 0;
  const miss = lineResult.status.missCount ?? 0;
  const lost = lineResult.status.lostCount ?? 0;

  return (
    <Card
      {...listeners}
      {...attributes}
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(
          transform ? { x: x + transform.x, y: y + transform.y, scaleX: 1, scaleY: 1 } : { x, y, scaleX: 1, scaleY: 1 },
        ),
      }}
      className={cn(
        "practice-card relative top-4 z-10 hidden h-fit max-w-4xl border py-1.5 sm:block",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onClick={() => {
        const seekCount = map.typingLineIndexes[lineSelectIndex - 1];
        if (seekCount) {
          moveSetLine(seekCount);
        }
      }}
    >
      <ResultCardContent
        lineKanaWord={lineKanaWord}
        types={lineResult.types}
        lineTypeWord={lineTypeWord}
        lostWord={lostWord}
      />

      <CardFooter className="py-1">
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
