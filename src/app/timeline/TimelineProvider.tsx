"use client";
import { Provider as JotaiProvider } from "jotai";
import { useSearchParams } from "next/navigation";
import React from "react";
import {
  getTimelineAtomStore,
  searchResultKeyWordsAtom,
  searchResultKpmAtom,
  searchResultModeAtom,
} from "./atoms/atoms";
import { DEFAULT_KPM_SEARCH_RANGE } from "./ts/const/consts";
import { FilterMode } from "./ts/type";

interface TimelineProviderProps {
  children: React.ReactNode;
}

const TimelineProvider = ({ children }: TimelineProviderProps) => {
  const searchParams = useSearchParams();
  const timelineAtomStore = getTimelineAtomStore();
  const searchMode = (searchParams.get("mode") || "all") as FilterMode;
  const minKpm = Number(searchParams.get("min-kpm") ?? DEFAULT_KPM_SEARCH_RANGE.min);
  const maxKpm = Number(searchParams.get("max-kpm") ?? DEFAULT_KPM_SEARCH_RANGE.max);
  const searchUserKeyWord = searchParams.get("user-keyword") || "";
  const searchMapKeyWord = searchParams.get("map-keyword") || "";
  timelineAtomStore.set(searchResultKeyWordsAtom, {
    mapKeyWord: searchMapKeyWord,
    userName: searchUserKeyWord,
  });

  timelineAtomStore.set(searchResultModeAtom, searchMode);
  timelineAtomStore.set(searchResultKpmAtom, {
    minValue: minKpm,
    maxValue: maxKpm,
  });

  return <JotaiProvider store={timelineAtomStore}>{children}</JotaiProvider>;
};

export default TimelineProvider;
