"use client";
import VolumeRange from "@/components/share-components/VolumeRange";
import { usePreviewPlayerState } from "@/lib/global-atoms/globalAtoms";
import { cn } from "@/lib/utils";
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
    <section className="mb-4 flex w-full flex-col gap-4">
      <SearchInputs />
      <div className={cn("flex flex-col md:flex-row", isLogin ? "justify-between gap-8" : "justify-end")}>
        <FilterAndSearchRange />
        {!isMobile && <VolumeRange player={player} />}
      </div>
      <SortAndMapListLength />
    </section>
  );
};

const FilterAndSearchRange = () => {
  const { data: session } = useSession();
  const isLogin = !!session?.user?.id;
  return (
    <div className="flex flex-col items-center gap-5 md:flex-row">
      {isLogin && <FilterInputs />}
      <SearchRange step={0.1} />
    </div>
  );
};
const SortAndMapListLength = () => {
  return (
    <div className="bg-card flex w-full flex-wrap items-center justify-between gap-1 overflow-x-auto rounded-md p-2 md:flex-nowrap">
      <SortOptions />
      <MapListLength />
    </div>
  );
};

export default SearchContent;
