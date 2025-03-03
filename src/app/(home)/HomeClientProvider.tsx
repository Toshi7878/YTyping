"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { useSearchParams } from "next/navigation";
import React from "react";
import { difficultyRangeAtom, getHomeAtomStore, searchMapKeyWordsAtom } from "./atoms/atoms";
import { DIFFICULTY_RANGE } from "./ts/const/consts";

const queryClient = new QueryClient();

interface TimelineProviderProps {
  children: React.ReactNode;
}

const HomeProvider = ({ children }: TimelineProviderProps) => {
  const homeAtomStore = getHomeAtomStore();
  const searchParams = useSearchParams();
  const searchMapKeyWord = searchParams.get("map-keyword") || "";
  const minRate = searchParams.get("minRate") || String(DIFFICULTY_RANGE.min);
  const maxRate = searchParams.get("maxRate") || String(DIFFICULTY_RANGE.max);

  homeAtomStore.set(searchMapKeyWordsAtom, searchMapKeyWord);
  homeAtomStore.set(difficultyRangeAtom, { min: Number(minRate), max: Number(maxRate) });

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={homeAtomStore}>{children}</JotaiProvider>
    </QueryClientProvider>
  );
};

export default HomeProvider;
