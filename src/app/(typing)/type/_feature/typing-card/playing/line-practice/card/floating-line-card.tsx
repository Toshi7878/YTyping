import { useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { useLineResultByIndex, useSelectLineIndexState } from "@/app/(typing)/type/_feature/atoms/line-results";
import { CHAR_POINT } from "@/app/(typing)/type/_feature/lib/const";
import { Card, CardFooter } from "@/ui/card";
import { cn } from "@/utils/cn";
import { useDraggablePosition } from "@/utils/hooks/use-draggable-position";
import { usePlayingInputModeState } from "../../../../atoms/typing-word";
import { moveSetLine } from "../../move-line";
import { ResultCardContent } from "./card-content";
import { ResultCardFooter } from "./card-footer";

export const FloatingPracticeLineCard = () => {
  const { dragProps, isDragging, wasDraggedRef, x, y } = useDraggablePosition();
  const map = useBuiltMapState();
  const lineSelectIndex = useSelectLineIndexState();
  const inputMode = usePlayingInputModeState();

  const index = map?.typingLineIndexes[lineSelectIndex - 1] ?? map?.typingLineIndexes[0] ?? 0;

  const _lineResult = useLineResultByIndex(index);
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
      {...dragProps}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
      className={cn(
        "practice-card relative top-4 z-10 hidden h-fit max-w-4xl touch-none select-none border py-1.5 sm:block",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onClick={() => {
        if (wasDraggedRef.current) return;

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
