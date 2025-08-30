"use client";
import VolumeRange from "@/components/shared/VolumeRange";
import { usePreviewPlayerState } from "@/lib/globalAtoms";
import SearchInputs from "./search/SearchInputs";
import SearchPopover from "./search/SearchPopover";

const SearchContent = () => {
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

export default SearchContent;
