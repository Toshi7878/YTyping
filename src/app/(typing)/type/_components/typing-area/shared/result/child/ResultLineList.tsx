"use client";
import {
  useLineResultsState,
  useLineSelectIndexState,
  useMapState,
  useSceneGroupState,
  useSetLineSelectIndex,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { LineResultData } from "@/app/(typing)/type/_lib/type";

import { useResultCards } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useMoveLine } from "@/app/(typing)/type/_lib/hooks/playing-hooks/moveLine";
import { ParseMap } from "@/utils/parse-map/parseMap";
import { Ticker } from "@pixi/ticker";
import { useCallback, useEffect, useRef } from "react";
import ResultCard from "./ResultCard";

function ResultLineList() {
  const map = useMapState() as ParseMap;
  const sceneGroup = useSceneGroupState();
  const lineResults = useLineResultsState();
  const { moveSetLine, drawerSelectColorChange } = useMoveLine();
  const { writeResultCards } = useResultCards();
  const lineSelectIndex = useLineSelectIndexState();
  const setLineSelectIndex = useSetLineSelectIndex();

  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    writeResultCards(cardRefs.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneGroup]);

  const practiceReplayCardClick = useCallback(
    (lineIndex: number) => {
      const seekCount = map.typingLineIndexes[lineIndex - 1];

      moveSetLine(seekCount);
      setLineSelectIndex(lineIndex);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const endCardClick = useCallback((lineIndex: number) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let lineIndex = 0;
  let scoreCount = 0;

  return (
    <>
      {lineResults.map((lineResult: LineResultData, index: number) => {
        const lineData = map.mapData[index];

        if (!lineData.notes.k) {
          return null;
        }

        lineIndex++;
        scoreCount += lineResult.status!.p! + lineResult.status!.tBonus!;

        return (
          <ResultCard
            key={index}
            lineResult={lineResult}
            lineData={lineData}
            count={index}
            lineIndex={lineIndex}
            scoreCount={scoreCount}
            cardRefs={cardRefs}
            handleCardClick={sceneGroup === "End" ? endCardClick : practiceReplayCardClick}
            selectIndex={lineSelectIndex}
          />
        );
      })}
    </>
  );
}

export default ResultLineList;
