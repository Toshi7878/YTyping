"use client";
import React, { createContext, useContext, useRef } from "react";
import {
  DEFAULT_GAME_STATE_REF,
  DEFAULT_STATUS_REF,
  DEFAULT_YT_STATE_REF,
} from "../ts/const/typeDefaultValue";
import { GameStateRef, RefsContextType, StatusRef, YTStateRef } from "../ts/type";

export const RefsContext = createContext<RefsContextType>({
  playerRef: { current: null },
  bestScoreRef: { current: 0 },
  statusRef: { current: structuredClone(DEFAULT_STATUS_REF) },
  ytStateRef: { current: structuredClone(DEFAULT_YT_STATE_REF) },
  gameStateRef: { current: structuredClone(DEFAULT_GAME_STATE_REF) },
  lineProgressRef: { current: null },
  totalProgressRef: { current: null },
  cardRefs: { current: [] },
  setRef: (ref: HTMLElement | any) => {},
});

export const RefsProvider = ({ children }) => {
  const playerRef = useRef(null);
  const bestScoreRef = useRef(0);
  const statusRef = useRef<StatusRef>(structuredClone(DEFAULT_STATUS_REF));
  const ytStateRef = useRef<YTStateRef>(structuredClone(DEFAULT_YT_STATE_REF));
  const gameStateRef = useRef<GameStateRef>(structuredClone(DEFAULT_GAME_STATE_REF));
  const lineProgressRef = useRef(null);
  const totalProgressRef = useRef(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const setRef = (key: string, ref: React.RefObject<HTMLElement> | any) => {
    switch (key) {
      case "playerRef":
        playerRef.current = ref;
        break;
      case "line_progress":
        lineProgressRef.current = ref;
        break;
      case "total_progress":
        totalProgressRef.current = ref;
        break;
      case "cardRefs":
        cardRefs.current = ref;
        break;
    }
  };

  return (
    <RefsContext.Provider
      value={{
        ytStateRef,
        gameStateRef,
        statusRef,
        lineProgressRef,
        totalProgressRef,
        cardRefs,
        bestScoreRef,
        playerRef,
        setRef,
      }}
    >
      {children}
    </RefsContext.Provider>
  );
};

export const useRefs = () => {
  const context = useContext(RefsContext);
  return {
    playerRef: context.playerRef,
    bestScoreRef: context.bestScoreRef,
    lineProgressRef: context.lineProgressRef,
    totalProgressRef: context.totalProgressRef,
    statusRef: context.statusRef,
    ytStateRef: context.ytStateRef,
    gameStateRef: context.gameStateRef,
    cardRefs: context.cardRefs,
    setRef: context.setRef,
  };
};
