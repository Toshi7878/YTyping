"use client";
import { Provider as JotaiProvider } from "jotai";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { difficultyRangeAtom, getHomeAtomStore, searchMapKeyWordsAtom } from "./atoms/atoms";
import { DIFFICULTY_RANGE } from "./ts/const/consts";

interface TimelineProviderProps {
  children: React.ReactNode;
}

const HomeClientProvider = ({ children }: TimelineProviderProps) => {
  const homeAtomStore = getHomeAtomStore();
  const searchParams = useSearchParams();

  // useEffectを使用して値を事前にセット
  useEffect(() => {
    const searchMapKeyWord = searchParams.get("keyword") || "";
    const minRate = searchParams.get("minRate") || String(DIFFICULTY_RANGE.min);
    const maxRate = searchParams.get("maxRate") || String(DIFFICULTY_RANGE.max);

    homeAtomStore.set(searchMapKeyWordsAtom, searchMapKeyWord);
    homeAtomStore.set(difficultyRangeAtom, { min: Number(minRate), max: Number(maxRate) });
  }, [searchParams, homeAtomStore]);

  return <JotaiProvider store={homeAtomStore}>{children}</JotaiProvider>;
};

export default HomeClientProvider;
