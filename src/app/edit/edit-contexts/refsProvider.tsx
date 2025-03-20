"use client";
import { YTPlayer } from "@/types/global-types";
import React, { createContext, useContext, useRef } from "react";
import { DEFAULT_EDIT_STATUS_REF } from "../ts/const/editDefaultValues";

export interface RefsContextType {
  rangeRef: React.RefObject<HTMLInputElement>;
  playerRef: React.RefObject<YTPlayer>;
  editStatus: React.RefObject<typeof DEFAULT_EDIT_STATUS_REF>;
  setRef: (key: string, ref: HTMLElement | any) => void;
}

const RefsContext = createContext<RefsContextType>({
  rangeRef: { current: null },
  playerRef: { current: null },
  editStatus: { current: DEFAULT_EDIT_STATUS_REF },
  setRef: (ref: HTMLElement | any) => {},
});
export const RefsProvider = ({ children }) => {
  const timeInputRef = useRef(null);
  const tbodyRef = useRef(null);
  const playerRef = useRef(null);
  const rangeRef = useRef(null);
  const editStatus = useRef(DEFAULT_EDIT_STATUS_REF);
  const setRef = (key: string, ref: React.RefObject<HTMLElement> | any) => {
    switch (key) {
      case "timeInputRef":
        timeInputRef.current = ref;
        break;
      case "tbody":
        tbodyRef.current = ref;
        break;
      case "playerRef":
        playerRef.current = ref;
        break;
      case "rangeRef":
        rangeRef.current = ref;
        break;
    }
  };

  return (
    <RefsContext.Provider
      value={{
        rangeRef,
        playerRef,
        editStatus,
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
    rangeRef: context.rangeRef,
    playerRef: context.playerRef,
    editStatus: context.editStatus,
    setRef: context.setRef,
  };
};
