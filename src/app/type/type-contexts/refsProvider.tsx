"use client";
import React, { createContext, useContext, useRef } from "react";
import { RefsContextType } from "../ts/type";

export const RefsContext = createContext<RefsContextType>({
  lineProgressRef: { current: null },
  totalProgressRef: { current: null },
  cardRefs: { current: [] },
  setRef: (ref: HTMLElement | any) => {},
});

export const RefsProvider = ({ children }) => {
  const lineProgressRef = useRef(null);
  const totalProgressRef = useRef(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const setRef = (key: string, ref: React.RefObject<HTMLElement> | any) => {
    switch (key) {
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
        lineProgressRef,
        totalProgressRef,
        cardRefs,
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
    lineProgressRef: context.lineProgressRef,
    totalProgressRef: context.totalProgressRef,
    cardRefs: context.cardRefs,
    setRef: context.setRef,
  };
};
