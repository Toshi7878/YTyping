"use client";
import { VolumeRange } from "@/shared/volume-range";
import { usePreviewYTPlayer } from "@/store/preview-yt-player";
import { CardWithContent } from "@/ui/card";
import { FilterFieldsPopover } from "./filter-popover";
import { ResultCountBadge } from "./list-count";
import { SearchInputs } from "./search-input-fields";
import { SortControls } from "./sort";

export const SearchContent = () => {
  const YTPlayer = usePreviewYTPlayer();

  return (
    <section className="space-y-6">
      <SearchInputs />
      <CardWithContent className={{ card: "p-0", cardContent: "flex flex-wrap items-center justify-between p-1.5" }}>
        <SortControls />
        <div className="flex items-center gap-3">
          <FilterFieldsPopover />
          <VolumeRange YTPlayer={YTPlayer} size="sm" sliderClassName="w-[140px]" />
          <ResultCountBadge />
        </div>
      </CardWithContent>
    </section>
  );
};
