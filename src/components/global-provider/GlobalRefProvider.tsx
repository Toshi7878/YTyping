"use client";
import React, { createContext, useContext, useRef } from "react";

export interface GlobalRefsContextType {
  playerRef: any;
  setRef: (key: string, ref: HTMLElement | any) => void;
}

const RefsContext = createContext<GlobalRefsContextType>({
  playerRef: null,
  setRef: (ref: HTMLElement | any) => {},
});
export const GlobalRefProvider = ({ children }) => {
  const playerRef = useRef(null);
  const setRef = (key: string, ref: React.RefObject<HTMLElement> | any) => {
    switch (key) {
      case "playerRef":
        playerRef.current = ref;
        break;
    }
  };

  return (
    <RefsContext.Provider
      value={{
        playerRef,
        setRef,
      }}
    >
      {children}
    </RefsContext.Provider>
  );
};

export const useGlobalRefs = () => {
  const context = useContext(RefsContext);
  return {
    playerRef: context.playerRef,
    setRef: context.setRef,
  };
};
