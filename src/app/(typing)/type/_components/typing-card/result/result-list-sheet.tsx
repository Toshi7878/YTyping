"use client";
import { Ticker } from "@pixi/ticker";
import { useCallback, useEffect, useRef } from "react";
import { usePlayer, useResultCards } from "@/app/(typing)/type/_lib/atoms/read-atoms";
import {
  useLineResultDrawerState,
  useMapState,
  useSceneGroupState,
  useSetLineResultDrawer,
  useSetLineSelectIndex,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useMoveLine } from "@/app/(typing)/type/_lib/playing/use-move-line";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ResultData } from "@/server/drizzle/validator/result";
import { OptimizedResultCard } from "./card/optimized-result-card";

export const ResultListSheet = () => {
  const isOpen = useLineResultDrawerState();
  const sceneGroup = useSceneGroupState();
  const setLineResultDrawer = useSetLineResultDrawer();

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setLineResultDrawer}>
      <SheetContent
        onEscapeKeyDown={sceneGroup === "Playing" ? (event) => event.preventDefault() : undefined}
        forceMount
        side="right"
        className="bg-accent/90 w-xs"
        overlayClassName="bg-transparent"
      >
        <SheetHeader className="py-2">
          <SheetTitle>{sceneGroup === "End" ? "詳細リザルト" : "練習リザルト"}</SheetTitle>
        </SheetHeader>

        <ResultLineList />
      </SheetContent>
    </Sheet>
  );
};

const ResultLineList = () => {
  const map = useMapState();

  const sceneGroup = useSceneGroupState();
  const { moveSetLine, drawerSelectColorChange } = useMoveLine();
  const { writeResultCards } = useResultCards();
  const setLineSelectIndex = useSetLineSelectIndex();
  const { readPlayer } = usePlayer();

  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    writeResultCards(cardRefs.current);
  }, [sceneGroup]);

  const practiceReplayCardClick = useCallback(
    (lineIndex: number) => {
      if (!map) return;
      const seekCount = Math.max(0, map.typingLineIndexes[lineIndex - 1] ?? 0);

      moveSetLine(seekCount);
      setLineSelectIndex(lineIndex);
    },
    [map, moveSetLine, setLineSelectIndex, readPlayer],
  );

  const endCardClick = useCallback(
    (lineIndex: number) => {
      let nextTypedCount = 0;
      const typedElements = cardRefs.current[lineIndex].querySelectorAll<HTMLElement>(".typed");

      const lastTypedChildClassList = typedElements[typedElements.length - 1].classList;

      if (lastTypedChildClassList[lastTypedChildClassList.length - 1] === "invisible") {
        return;
      }
      for (let i = 0; i < typedElements.length; i++) {
        typedElements[i].classList.add("invisible");
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

        const nextTime = nextCharElement.dataset.time;

        if (currentTime > Number(nextTime)) {
          nextCharElement.classList.remove("invisible");
          nextTypedCount++;
        }
      };

      if (!ticker.started) {
        ticker.add(handleTick);
        ticker.start();
        drawerSelectColorChange(lineIndex);
      }
    },
    [drawerSelectColorChange],
  );

  let lineIndex = 0;
  const scoreCount = 0;

  return (
    <div className="relative h-full overflow-y-auto px-4">
      {map?.initialLineResultData.map((_: ResultData[number], index: number) => {
        const lineData = map.mapData[index];

        if (!lineData.kanaWord) return null;

        lineIndex++;
        // scoreCount += (lineResult.status?.p ?? 0) + (lineResult.status?.tBonus ?? 0);

        return (
          <OptimizedResultCard
            // biome-ignore lint/suspicious/noArrayIndexKey: <固定長配列なのでindex keyを許可>
            key={index}
            count={index}
            lineIndex={lineIndex}
            scoreCount={scoreCount}
            cardRefs={cardRefs}
            lineData={lineData}
            handleCardClick={sceneGroup === "End" ? endCardClick : practiceReplayCardClick}
          />
        );
      })}
    </div>
  );
};
