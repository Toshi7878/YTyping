"use client";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import React from "react";
import { getTimelineAtomStore, searchResultKpmAtom, searchResultModeAtom } from "./atoms/atoms";
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

  useHydrateAtoms(
    [
      [searchResultModeAtom, searchMode],
      [searchResultKpmAtom, { minValue: minKpm, maxValue: maxKpm }],
    ],
    { store: timelineAtomStore }
  );

  return <JotaiProvider store={timelineAtomStore}>{children}</JotaiProvider>;
};

export default TimelineProvider;
