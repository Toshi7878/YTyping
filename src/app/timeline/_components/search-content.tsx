"use client";
import { VolumeRange } from "@/components/shared/volume-range";
import { usePreviewPlayerState } from "@/lib/atoms/global-atoms";
import { FilterFieldsPopover } from "./search/filter-fields-popover";
import { SearchInputs } from "./search/search-input-fields";

export const SearchContent = () => {
  const player = usePreviewPlayerState();

  return (
    <section className="space-y-6">
      <SearchInputs />

      <div className="flex justify-between">
        <FilterFieldsPopover />
        <VolumeRange player={player} />
      </div>
    </section>
  );
};
