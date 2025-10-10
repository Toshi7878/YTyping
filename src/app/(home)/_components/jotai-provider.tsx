"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import type React from "react";
import { getHomeAtomStore, pendingDifficultyRangeAtom } from "../_lib/atoms";

interface JotaiProviderProps {
  children: React.ReactNode;
  minRate: number;
  maxRate: number;
}

export const JotaiProvider = ({ children, minRate, maxRate }: JotaiProviderProps) => {
  const store = getHomeAtomStore();
  useHydrateAtoms([[pendingDifficultyRangeAtom, { minRate, maxRate }]], { store });
  return <Provider store={store}>{children}</Provider>;
};
