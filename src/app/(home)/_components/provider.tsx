"use client";
import { Provider } from "jotai";
import type React from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import { getHomeAtomStore, pendingDifficultyRangeAtom } from "../_lib/atoms";

interface JotaiProviderProps {
  children: React.ReactNode;
  minRate: number;
  maxRate: number;
}

export const JotaiProvider = ({ children, minRate, maxRate }: JotaiProviderProps) => {
  const store = getHomeAtomStore();
  return (
    <Provider store={store}>
      <AtomsHydrator atomValues={[[pendingDifficultyRangeAtom, { minRate, maxRate }]]}>{children}</AtomsHydrator>
    </Provider>
  );
};
