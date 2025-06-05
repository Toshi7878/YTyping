import VolumeRange from "@/components/share-components/VolumeRange";
import { usePreviewPlayerState } from "@/lib/global-atoms/globalAtoms";
import { useUserAgent } from "@/utils/useUserAgent";
import SearchInputs from "./child/SearchInputs";
import SearchModal from "./child/SearchModal";

const SearchContent = () => {
  const player = usePreviewPlayerState();
  const { isMobile } = useUserAgent();

  return (
    <section className="mb-4 flex w-full items-center">
      <div className="w-full">
        <div className="mb-3">
          <SearchInputs />
        </div>
        <div className="flex justify-between">
          <SearchModal />
          {!isMobile && (
            <div className="flex justify-end">
              <VolumeRange player={player} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchContent;
