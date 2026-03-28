"use client";
import { Ticker } from "@pixi/ticker";
import { useRef, useState } from "react";
import { setLineSelectIndex, useBuiltMapState } from "@/app/(typing)/type/_lib/atoms/state";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { TypingLineResults } from "@/validator/result";
import { OptimizedResultCard } from "./card/line-card";

interface ResultLineSheetProps {
  trigger: React.ReactNode;
}

export const ResultLineSheet = ({ trigger }: ResultLineSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent forceMount side="right" className="w-xs bg-accent/90" overlayClassName="bg-transparent">
        <SheetHeader className="py-2">
          <SheetTitle>詳細リザルト</SheetTitle>
        </SheetHeader>

        {isOpen && <ResultLineList />}
      </SheetContent>
    </Sheet>
  );
};

const ResultLineList = () => {
  const map = useBuiltMapState();
  const itemsRef = useRef<HTMLDivElement[]>([]);

  const handleCardClick = (lineIndex: number) => {
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
            onClick={handleCardClick}
          />
        );
      })}
    </div>
  );
};
