"use client";
import { VolumeRange } from "@/components/shared/volume-range";
import { usePreviewPlayerState } from "@/lib/global-atoms";
import { SearchInputs } from "./search/search-input-field";
import { SearchPopover } from "./search/search-popover";

export const SearchContent = () => {
  const player = usePreviewPlayerState();

  return (
    <section className="space-y-6">
      <SearchInputs />

      <div className="flex justify-between">
        <SearchPopover />
        <VolumeRange player={player} />
      </div>
    </section>
  );
};
