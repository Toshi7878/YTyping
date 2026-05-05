"use client";
import { usePreviewYTPlayer } from "@/app/_layout/preview-youtube";
import { VolumeRange } from "@/components/shared/volume-range";
import { FilterFieldsPopover } from "./filter-popover";
import { SearchInputs } from "./search-input-fields";

export const SearchContent = () => {
  const YTPlayer = usePreviewYTPlayer();

  return (
    <section className="space-y-6">
      <SearchInputs />

      <div className="flex justify-between">
        <FilterFieldsPopover />
        <VolumeRange YTPlayer={YTPlayer} />
      </div>
    </section>
  );
};
