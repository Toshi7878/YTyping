"use client";
import { useSession } from "next-auth/react";
import { VolumeRange } from "@/components/shared/volume-range";
import { usePreviewPlayerState } from "@/lib/global-atoms";
import { cn } from "@/lib/utils";
import { MapFilter } from "./search/map-filter";
import { SearchInput } from "./search/search-input";
import { SortAndMapListLength } from "./search/sort-and-map-list-length";

export const MapControlArea = () => {
  const { data: session } = useSession();
  const player = usePreviewPlayerState();

  const isLogin = !!session?.user?.id;

  return (
    <section className="mb-4 flex w-full flex-col gap-4">
      <SearchInput />
      <div className={cn("flex flex-col md:flex-row space-y-4", isLogin ? "justify-between" : "justify-end")}>
        <MapFilter />
        <VolumeRange player={player} />
      </div>
      <SortAndMapListLength />
    </section>
  );
};
