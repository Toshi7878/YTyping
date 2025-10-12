"use client";
import { VolumeRange } from "@/components/shared/volume-range";
import { usePreviewPlayerState } from "@/lib/global-atoms";
import { MapFilter } from "./search/map-filter";
import { SearchInput } from "./search/search-input";
import { SortControlsAndMapCount } from "./search/sort-controls-and-map-count";

export const MapControlArea = () => {
  const player = usePreviewPlayerState();

  return (
    <section className="mb-4 flex w-full flex-col gap-4">
      <SearchInput />
      <div className="flex md:flex-row flex-col md:space-y-0 space-y-4 justify-between">
        <MapFilter />
        <VolumeRange player={player} />
      </div>
      <SortControlsAndMapCount />
    </section>
  );
};
