"use client";
import { Provider as JotaiProvider } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { difficultyRangeAtom, getHomeAtomStore, searchMapKeyWordsAtom } from "./atoms/atoms";
import { DIFFICULTY_RANGE } from "./ts/const/consts";

interface TimelineProviderProps {
  children: React.ReactNode;
}

const HomeProvider = ({ children }: TimelineProviderProps) => {
  const homeAtomStore = getHomeAtomStore();
  const searchParams = useSearchParams();
  const searchMapKeyWord = searchParams.get("map-keyword") || "";
  const minRate = searchParams.get("minRate") || String(DIFFICULTY_RANGE.min);
  const maxRate = searchParams.get("maxRate") || String(DIFFICULTY_RANGE.max);

  useEffect(() => {
    homeAtomStore.set(searchMapKeyWordsAtom, searchMapKeyWord);
    homeAtomStore.set(difficultyRangeAtom, { min: Number(minRate), max: Number(maxRate) });
  }, [homeAtomStore, searchMapKeyWord, minRate, maxRate]);

  return <JotaiProvider store={homeAtomStore}>{children}</JotaiProvider>;
};

export default HomeProvider;
