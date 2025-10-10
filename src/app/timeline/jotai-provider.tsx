"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import type React from "react";
import type { ResultListSearchParams } from "@/utils/queries/schema/result-list";
import {
  getTimelineAtomStore,
  searchResultClearRateAtom,
  searchResultKpmAtom,
  searchResultModeAtom,
  searchResultSpeedRangeAtom,
} from "./_lib/atoms";

interface TimelineProviderProps {
  children: React.ReactNode;
  params: ResultListSearchParams;
}

export const JotaiProvider = ({ children, params }: TimelineProviderProps) => {
  const store = getTimelineAtomStore();

  useHydrateAtoms(
    [
      [searchResultModeAtom, params.mode],
      [searchResultKpmAtom, { min: params.minKpm, max: params.maxKpm }],
      [searchResultClearRateAtom, { min: params.minClearRate, max: params.maxClearRate }],
      [searchResultSpeedRangeAtom, { min: params.minPlaySpeed, max: params.maxPlaySpeed }],
    ],
    { store },
  );

  return <Provider store={store}>{children}</Provider>;
};
