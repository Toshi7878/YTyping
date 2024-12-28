"use client";
import { Provider as JotaiProvider } from "jotai";
import { useSearchParams } from "next/navigation";
import React from "react";
import { getHomeAtomStore, searchMapKeyWordsAtom } from "./atoms/atoms";

interface TimelineProviderProps {
  children: React.ReactNode;
}

const HomeProvider = ({ children }: TimelineProviderProps) => {
  const homeAtomStore = getHomeAtomStore();
  const searchParams = useSearchParams();
  const searchMapKeyWord = searchParams.get("map-keyword") || "";
  homeAtomStore.set(searchMapKeyWordsAtom, searchMapKeyWord);

  return <JotaiProvider store={homeAtomStore}>{children}</JotaiProvider>;
};

export default HomeProvider;
