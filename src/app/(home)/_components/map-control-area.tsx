"use client";
import { VolumeRange } from "@/components/shared/volume-range";
import { usePreviewPlayerState } from "@/lib/atoms/global-atoms";
import { getBaseURL } from "@/lib/get-base-url";
import { MapFilter } from "./search/map-filter";
import { SearchInput } from "./search/search-input";
import { SortControlsAndMapCount } from "./search/sort-controls-and-map-count";

export const MapControlArea = () => {
  const YTPlayer = usePreviewPlayerState();

  return (
    <section className="mb-4 flex w-full flex-col gap-4">
      <SearchInput />
      {getBaseURL()}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:space-y-0">
        <MapFilter />
        <VolumeRange YTPlayer={YTPlayer} />
      </div>
      <SortControlsAndMapCount />
    </section>
  );
};
