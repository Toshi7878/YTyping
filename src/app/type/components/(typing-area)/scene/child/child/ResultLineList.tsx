"use client";
import {
  lineResultsAtom,
  lineSelectIndexAtom,
  mapAtom,
  sceneAtom,
} from "@/app/type/(atoms)/gameRenderAtoms";
import { useRefs } from "@/app/type/(contexts)/refsProvider";
import { LineResultData } from "@/app/type/(ts)/type";

import { useAtom, useAtomValue } from "jotai";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import ResultCard from "./ResultCard";

interface ResultLineListProps {
  modalContentRef: React.RefObject<HTMLDivElement>;
}

function ResultLineList({ modalContentRef }: ResultLineListProps) {
  const map = useAtomValue(mapAtom);
  const scene = useAtomValue(sceneAtom);
  const { playerRef, gameStateRef } = useRefs();
  const lineResults = useAtomValue(lineResultsAtom);

  const [lineSelectIndex, setLineSelectIndex] = useAtom(lineSelectIndexAtom);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const scrollToCard = useCallback((newIndex: number) => {
    const card = cardRefs.current[newIndex];
    if (modalContentRef.current && card) {
      const scrollHeight = modalContentRef.current.scrollHeight;
      modalContentRef.current.scrollTop =
        (scrollHeight * (newIndex - 2)) / map!.typingLineNumbers.length;
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        setLineSelectIndex((prev) => {
          const newIndex = Math.max(1, prev - 1);
          scrollToCard(newIndex);
          return newIndex;
        });
      } else if (event.key === "ArrowDown") {
        setLineSelectIndex((prev) => {
          const newIndex = Math.min(prev + 1, map!.typingLineNumbers.length);
          scrollToCard(newIndex);
          return newIndex;
        });
      } else if (event.key === "Enter") {
        const card = cardRefs.current[lineSelectIndex];
        const seekTime = Number(card.dataset.seekTime);
        const lineNumber = Number(card.dataset.lineNumber);
        const index = Number(card.dataset.count);
        if (card) {
          handleCardClick(lineNumber, seekTime, index);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineSelectIndex],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);

  useEffect(() => {
    if (lineSelectIndex > 1) {
      scrollToCard(lineSelectIndex);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let lineCount = 0;

  const handleCardClick = useCallback(
    (lineNumber: number, seekTime: number, index: number) => {
      if (scene === "replay") {
        playerRef.current.seekTo(seekTime);
      } else {
        playerRef.current.seekTo(0 > seekTime ? 0 : seekTime);
        gameStateRef.current!.practice.setLineCount = index;
      }
      setLineSelectIndex(lineNumber);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene],
  );

  const handleCardHover = useCallback(
    (lineNumber: number) => {
      setLineSelectIndex(lineNumber);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const memoizedResultCards = useMemo(
    () =>
      lineResults.map((lineResult: LineResultData, index: number) => {
        const lineData = map!.words[index];

        if (!lineData.notes.k) {
          return null;
        }

        lineCount++;
        return (
          <ResultCard
            key={index}
            lineResult={lineResult}
            lineData={lineData}
            index={index}
            lineCount={lineCount}
            cardRefs={cardRefs}
            lineSelectIndex={lineSelectIndex}
            handleCardClick={handleCardClick}
            handleCardHover={handleCardHover}
          />
        );
      }),
    [lineResults, lineSelectIndex, handleCardClick, handleCardHover],
  );

  return <>{memoizedResultCards}</>;
}

export default ResultLineList;
