"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { type ReactNode, useEffect } from "react";
import type { RouterOutPuts } from "@/server/api/trpc";
import { mapInfoAtom, setMapInfo, typingOptionsAtom } from "../_lib/atoms/hydrate";
import { getTypeAtomStore } from "../_lib/atoms/store";

interface JotaiProviderProps {
  userTypingOptions: RouterOutPuts["userOption"]["getUserTypingOptions"];
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
  children: ReactNode;
}

export const JotaiProvider = ({ userTypingOptions, mapInfo, children }: JotaiProviderProps) => {
  const store = getTypeAtomStore();

  useHydrateAtoms(
    [[mapInfoAtom, mapInfo], ...(userTypingOptions ? [[typingOptionsAtom, userTypingOptions] as const] : [])],
    { store },
  );

  useEffect(() => {
    setMapInfo(mapInfo);
  }, [mapInfo]);

  return <Provider store={store}>{children}</Provider>;
};
