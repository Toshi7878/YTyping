"use client";
import {
  lineSelectIndexAtom,
  useLineResultsAtom,
  useMapAtom,
  useSceneAtom,
  useSetLineSelectIndexAtom,
} from "@/app/type/atoms/stateAtoms";
import { LineResultData } from "@/app/type/ts/type";

import { useResultCards } from "@/app/type/atoms/refAtoms";
import { useMoveLine } from "@/app/type/hooks/playing-hooks/useMoveLine";
import { Ticker } from "@pixi/ticker";
import { useStore } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import ResultCard from "./ResultCard";

function ResultLineList() {
  const map = useMapAtom();
  const scene = useSceneAtom();
  const lineResults = useLineResultsAtom();
  const typeAtomStore = useStore();
  const { moveSetLine, scrollToCard, drawerSelectColorChange } = useMoveLine();
  const setLineSelectIndex = useSetLineSelectIndexAtom();
  const { writeResultCards } = useResultCards();

  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    writeResultCards(cardRefs.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    const lineSelectIndex = typeAtomStore.get(lineSelectIndexAtom);
    scrollToCard(lineSelectIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const practiceReplayCardClick = useCallback(
    (lineNumber: number) => {
      // onClose();
      const seekCount = map!.typingLineNumbers[lineNumber - 1];

      moveSetLine(seekCount);
      setLineSelectIndex(lineNumber);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const endCardClick = useCallback((lineNumber: number) => {
    let nextTypedCount = 0;
    const typedElements = cardRefs.current[lineNumber].querySelectorAll(
      ".typed"
    ) as NodeListOf<HTMLElement>;

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
      drawerSelectColorChange(lineNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let lineCount = 0;
  let scoreCount = 0;

  return (
    <>
      {lineResults.map((lineResult: LineResultData, index: number) => {
        const lineData = map!.mapData[index];

        if (!lineData.notes.k) {
          return null;
        }

        lineCount++;
        scoreCount += lineResult.status!.p! + lineResult.status!.tBonus!;

        const lineSelectIndex = typeAtomStore.get(lineSelectIndexAtom);

        return (
          <ResultCard
            key={index}
            lineResult={lineResult}
            lineData={lineData}
            index={index}
            lineCount={lineCount}
            scoreCount={scoreCount}
            cardRefs={cardRefs}
            handleCardClick={scene === "end" ? endCardClick : practiceReplayCardClick}
            selectIndex={lineSelectIndex}
          />
        );
      })}
    </>
  );
}

export default ResultLineList;
