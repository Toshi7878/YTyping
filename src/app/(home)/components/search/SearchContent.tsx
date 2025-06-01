"use client";
import VolumeRange from "@/components/share-components/VolumeRange";
import { usePreviewPlayerState } from "@/lib/global-atoms/globalAtoms";
import { useUserAgent } from "@/util/useUserAgent";
import { useSession } from "next-auth/react";
import FilterInputs from "./child/FilterInputs";
import SearchInputs from "./child/SearchInputs";
import SortOptions from "./child/SortOptions";
import MapListLength from "./child/child/MapListLength";
import SearchRange from "./child/child/SearchRange";

const SearchContent = () => {
  const { data: session } = useSession();
  const player = usePreviewPlayerState();
  const { isMobile } = useUserAgent();

  const isLogin = !!session?.user?.id;
  return (
    <section className="mb-4 flex w-full items-center">
      <div className="w-full">
        <div className="mb-3">
          <SearchInputs />
        </div>
        <div
          className={`flex ${isLogin ? "justify-between" : "justify-end"} ${
            isLogin ? "" : "gap-8"
          } flex-col md:flex-row`}
        >
          <div className="flex flex-col items-center gap-5 md:flex-row">
            {isLogin && <FilterInputs />}
            <SearchRange step={0.1} />
          </div>
          {!isMobile && <VolumeRange player={player} />}
        </div>
        <div className="mt-4">
          <div className="bg-card flex w-full flex-wrap items-center justify-between gap-1 overflow-x-auto rounded-md p-2 md:flex-nowrap">
            <SortOptions />
            <MapListLength />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchContent;
