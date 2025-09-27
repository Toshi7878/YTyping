"use client";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { getTimelineAtomStore, searchResultKpmAtom, searchResultModeAtom } from "./_lib/atoms";
import { DEFAULT_KPM_SEARCH_RANGE } from "./_lib/consts";
import type { FilterMode } from "./_lib/type";

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
    { store: timelineAtomStore },
  );

  return <JotaiProvider store={timelineAtomStore}>{children}</JotaiProvider>;
};

export default TimelineProvider;
