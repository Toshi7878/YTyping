"use client";
import { Ticker } from "@pixi/ticker";
import { type RefObject, useRef, useState } from "react";
import { setLineSelectIndex, useBuiltMapState } from "@/app/(typing)/type/_lib/atoms/state";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { TypingLineResults } from "@/validator/result";
import { moveSetLine } from "../../../_lib/playing/move-line";
import { OptimizedResultCard } from "./card/line-card";

export const ReplayResultLineSheet = ({
  trigger,
  open,
  setOpen,
}: {
  trigger: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const map = useBuiltMapState();
  const handleCardClick = (lineIndex: number) => {
    if (!map) return;
    const seekCount = Math.max(0, map.typingLineIndexes[lineIndex - 1] ?? 0);

    moveSetLine(seekCount);
    setLineSelectIndex(lineIndex);
  };

  return (
    <Sheet modal={false} open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent forceMount side="right" className="w-xs bg-accent/90" overlayClassName="bg-transparent">
        <SheetHeader className="py-2">
          <SheetTitle>詳細リザルト</SheetTitle>
        </SheetHeader>
        <ResultLineList onCardClick={handleCardClick} />
      </SheetContent>
    </Sheet>
  );
};

export const EndResultLineSheet = ({ trigger }: { trigger: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleCardClick = (lineIndex: number, itemsRef: RefObject<HTMLDivElement[]>) => {
    let nextTypedCount = 0;
    const typedElements = itemsRef.current[lineIndex]?.querySelectorAll<HTMLElement>(".typed");
    if (!typedElements) return;

    const lastTypedChildClassList = typedElements[typedElements.length - 1]?.classList;
    if (!lastTypedChildClassList) return;

    if (lastTypedChildClassList[lastTypedChildClassList.length - 1] === "invisible") {
      return;
    }
    for (let i = 0; i < typedElements.length; i++) {
      typedElements[i]?.classList.add("invisible");
    }
    const date = Date.now();
    const handleTick = () => handleResultCardReplay(date, typedElements);

    const ticker = new Ticker();
    const handleResultCardReplay = (date: number, typedElements: NodeListOf<HTMLElement>) => {
      const currentTime = (Date.now() - date) / 1000;
      const nextCharElement = typedElements[nextTypedCount];

      if (typedElements.length - 1 < nextTypedCount) {
        ticker.stop();
        ticker.remove(handleTick);
        return;
      }

      const nextTime = nextCharElement?.dataset.time;

      if (currentTime > Number(nextTime)) {
        nextCharElement?.classList.remove("invisible");
        nextTypedCount++;
      }
    };

    if (!ticker.started) {
      ticker.add(handleTick);
      ticker.start();
      setLineSelectIndex(lineIndex);
    }
  };

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent forceMount side="right" className="w-xs bg-accent/90" overlayClassName="bg-transparent">
        <SheetHeader className="py-2">
          <SheetTitle>詳細リザルト</SheetTitle>
        </SheetHeader>
        {isOpen && <ResultLineList onCardClick={handleCardClick} />}
      </SheetContent>
    </Sheet>
  );
};

const ResultLineList = ({
  onCardClick,
}: {
  onCardClick: (lineIndex: number, itemsRef: RefObject<HTMLDivElement[]>) => void;
}) => {
  const map = useBuiltMapState();
  const itemsRef = useRef<HTMLDivElement[]>([]);
  let lineIndex = 0;

  return (
    <div className="relative h-full overflow-y-auto px-4">
      {map?.initialLineResults.map((_: TypingLineResults[number], index: number) => {
        const lineData = map.lines[index];
        if (!lineData?.kanaLyrics) return null;

        lineIndex++;

        return (
          <OptimizedResultCard
            // biome-ignore lint/suspicious/noArrayIndexKey: <固定長配列なのでindex keyを許可>
            key={index}
            count={index}
            lineIndex={lineIndex}
            itemsRef={itemsRef}
            lineData={lineData}
            onClick={(lineIndex) => onCardClick(lineIndex, itemsRef)}
          />
        );
      })}
    </div>
  );
};
