"use client";
import { useMapState, useSceneGroupState, useSetLineSelectIndex } from "@/app/(typing)/type/_lib/atoms/stateAtoms";

import { usePlayer, useResultCards } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useMoveLine } from "@/app/(typing)/type/_lib/hooks/playing/moveLine";
import { ResultData } from "@/server/drizzle/validator/result";
import { Ticker } from "@pixi/ticker";
import { useCallback, useEffect, useRef } from "react";
import OptimizedResultCard from "./OptimizedResultCard";

function ResultLineList() {
  const map = useMapState();
  if (!map) return null;

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
      const seekCount = Math.max(0, map?.typingLineIndexes[lineIndex - 1] ?? 0);

      moveSetLine(seekCount);
      setLineSelectIndex(lineIndex);
    },
    [map, moveSetLine, setLineSelectIndex, readPlayer],
  );

  const endCardClick = useCallback(
    (lineIndex: number) => {
      let nextTypedCount = 0;
      const typedElements = cardRefs.current[lineIndex].querySelectorAll(".typed") as NodeListOf<HTMLElement>;

      const lastTypedChildClassList = typedElements[typedElements.length - 1].classList;

      if (lastTypedChildClassList[lastTypedChildClassList.length - 1] === "invisible") {
        return;
      }
      for (let i = 0; i < typedElements.length; i++) {
        typedElements[i].classList.add("invisible");
      }
      const date = new Date().getTime();
      const handleTick = () => handleResultCardReplay(date, typedElements);

      const ticker = new Ticker();
      const handleResultCardReplay = (date: number, typedElements: NodeListOf<HTMLElement>) => {
        const currentTime = (new Date().getTime() - date) / 1000;
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
  let scoreCount = 0;

  return (
    <div className="relative h-full overflow-y-auto px-4">
      {map.initialLineResultData.map((_: ResultData[number], index: number) => {
        const lineData = map.mapData[index];

        if (!lineData.kanaWord) return null;

        lineIndex++;
        // scoreCount += (lineResult.status?.p ?? 0) + (lineResult.status?.tBonus ?? 0);

        return (
          <OptimizedResultCard
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
}

export default ResultLineList;
