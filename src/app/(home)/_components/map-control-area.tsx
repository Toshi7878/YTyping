"use client";
import { useSession } from "next-auth/react";
import { VolumeRange } from "@/components/shared/volume-range";
import { usePreviewPlayerState } from "@/lib/global-atoms";
import { cn } from "@/lib/utils";
import { MapFilter } from "./search/map-filter";
import { SearchInput } from "./search/search-input";
import { SortAndMapListLength } from "./search/sort-and-map-list-length";

export const MapControlArea = () => {
  const player = usePreviewPlayerState();

  return (
    <section className="mb-4 flex w-full flex-col gap-4">
      <SearchInput />
      <div className="flex md:flex-row flex-col md:space-y-0 space-y-4 justify-between">
        <MapFilter />
        <VolumeRange player={player} />
      </div>
      <SortAndMapListLength />
    </section>
  );
};
