"use client";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import React from "react";
import { difficultyRangeAtom, getHomeAtomStore } from "./shared/atoms";
import { DIFFICULTY_RANGE, PARAM_NAME } from "./shared/const";

interface TimelineProviderProps {
  children: React.ReactNode;
}

const HomeClientProvider = ({ children }: TimelineProviderProps) => {
  const homeAtomStore = getHomeAtomStore();
  const searchParams = useSearchParams();
  const minRate = searchParams.get(PARAM_NAME.minRate);
  const maxRate = searchParams.get(PARAM_NAME.maxRate);

  useHydrateAtoms(
    [
      [
        difficultyRangeAtom,
        {
          min: Number(minRate) || DIFFICULTY_RANGE.min,
          max: Number(maxRate) || DIFFICULTY_RANGE.max,
        },
      ],
    ],
    { store: homeAtomStore },
  );

  return <JotaiProvider store={homeAtomStore}>{children}</JotaiProvider>;
};

export default HomeClientProvider;
