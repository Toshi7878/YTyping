"use client";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { PARAM_NAME } from "@/utils/queries/search-params/map-list";
import { difficultyRangeAtom, getHomeAtomStore } from "./_lib/atoms";
import { DIFFICULTY_RANGE } from "./_lib/const";

interface HomeClientProviderProps {
  children: React.ReactNode;
}

export const HomeClientProvider = ({ children }: HomeClientProviderProps) => {
  const store = getHomeAtomStore();
  const searchParams = useSearchParams();
  const minRate = searchParams.get(PARAM_NAME.minRate);
  const maxRate = searchParams.get(PARAM_NAME.maxRate);

  useHydrateAtoms(
    [
      [
        difficultyRangeAtom,
        { min: Number(minRate) || DIFFICULTY_RANGE.min, max: Number(maxRate) || DIFFICULTY_RANGE.max },
      ],
    ],
    { store },
  );

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};
