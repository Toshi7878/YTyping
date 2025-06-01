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
    <section className="w-full flex items-center mb-4">
      <div className="w-full">
        <div className="mb-3">
          <SearchInputs />
        </div>
        <div
          className={`flex ${isLogin ? "justify-between" : "justify-end"} ${
            isLogin ? "" : "gap-8"
          } flex-col md:flex-row`}
        >
          <div className="flex items-center gap-5 flex-col md:flex-row">
            {isLogin && <FilterInputs />}
            <SearchRange step={0.1} />
          </div>
          {!isMobile && <VolumeRange player={player} />}
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-800 text-white p-2 rounded-md overflow-x-auto flex flex-wrap md:flex-nowrap justify-between items-center gap-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <SortOptions />
            <MapListLength />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchContent;
