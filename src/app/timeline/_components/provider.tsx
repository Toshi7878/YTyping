"use client";
import { Provider } from "jotai";
import type React from "react";
import { AtomsHydrator } from "@/components/shared/jotai";
import type { ResultListSearchParams } from "@/lib/search-params/result-list";
import {
  getTimelineAtomStore,
  searchResultClearRateAtom,
  searchResultKpmAtom,
  searchResultModeAtom,
  searchResultSpeedRangeAtom,
} from "../_lib/atoms";

interface TimelineProviderProps {
  children: React.ReactNode;
  params: ResultListSearchParams;
}

export const JotaiProvider = ({ children, params }: TimelineProviderProps) => {
  const store = getTimelineAtomStore();

  return (
    <Provider store={store}>
      <AtomsHydrator
        atomValues={[
          [searchResultModeAtom, params.mode],
          [searchResultKpmAtom, { min: params.minKpm, max: params.maxKpm }],
          [searchResultClearRateAtom, { min: params.minClearRate, max: params.maxClearRate }],
          [searchResultSpeedRangeAtom, { min: params.minPlaySpeed, max: params.maxPlaySpeed }],
        ]}
      >
        {children}
      </AtomsHydrator>
    </Provider>
  );
};
