"use client";
import React, { createContext, useContext, useRef } from "react";
import { RefsContextType } from "../ts/type";

export const RefsContext = createContext<RefsContextType>({
  cardRefs: { current: [] },
  setRef: (ref: HTMLElement | any) => {},
});

export const RefsProvider = ({ children }) => {
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const setRef = (key: string, ref: React.RefObject<HTMLElement> | any) => {
    switch (key) {
      case "cardRefs":
        cardRefs.current = ref;
        break;
    }
  };

  return (
    <RefsContext.Provider
      value={{
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
    cardRefs: context.cardRefs,
    setRef: context.setRef,
  };
};
