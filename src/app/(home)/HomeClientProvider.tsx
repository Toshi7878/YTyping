"use client";
import { Provider as JotaiProvider } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { difficultyRangeAtom, getHomeAtomStore } from "./atoms/atoms";
import { DIFFICULTY_RANGE, PARAM_NAME } from "./ts/const/consts";

interface TimelineProviderProps {
  children: React.ReactNode;
}

const HomeClientProvider = ({ children }: TimelineProviderProps) => {
  const homeAtomStore = getHomeAtomStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const minRate = searchParams.get(PARAM_NAME.minRate);
    const maxRate = searchParams.get(PARAM_NAME.maxRate);
    homeAtomStore.set(difficultyRangeAtom, {
      min: Number(minRate) || DIFFICULTY_RANGE.min,
      max: Number(maxRate) || DIFFICULTY_RANGE.max,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return <JotaiProvider store={homeAtomStore}>{children}</JotaiProvider>;
};

export default HomeClientProvider;
