"use client";
import VolumeRange from "@/components/share-components/VolumeRange";
import { usePreviewPlayerState } from "@/lib/globalAtoms";
import SearchInputs from "./child/SearchInputs";
import SearchModal from "./child/SearchModal";

const SearchContent = () => {
  const player = usePreviewPlayerState();

  return (
    <section className="mb-4 flex w-full items-center">
      <div className="w-full">
        <div className="mb-3">
          <SearchInputs />
        </div>
        <div className="flex justify-between">
          <SearchModal />
          <VolumeRange player={player} />
        </div>
      </div>
    </section>
  );
};

export default SearchContent;
