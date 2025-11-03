"use client";
import { VolumeRange } from "@/components/shared/volume-range";
import { usePreviewPlayerState } from "@/lib/atoms/global-atoms";
import { FilterFieldsPopover } from "./search/filter-fields-popover";
import { SearchInputs } from "./search/search-input-fields";

export const SearchContent = () => {
  const YTPlayer = usePreviewPlayerState();

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
