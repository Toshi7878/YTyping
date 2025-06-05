"use client";
import VolumeRange from "@/components/share-components/VolumeRange";
import { usePreviewPlayerState } from "@/lib/global-atoms/globalAtoms";
import { cn } from "@/lib/utils";
import { useUserAgent } from "@/utils/useUserAgent";
import { useSession } from "next-auth/react";
import FilterContents from "./search/FilterContents";
import SearchInputs from "./search/Search";
import SortAndMapListLength from "./search/SortAndMapListLength";

const MapControlArea = () => {
  const { data: session } = useSession();
  const player = usePreviewPlayerState();
  const { isMobile } = useUserAgent();

  const isLogin = !!session?.user?.id;

  return (
    <section className="mb-4 flex w-full flex-col gap-4">
      <SearchInputs />
      <div className={cn("flex flex-col md:flex-row", isLogin ? "justify-between gap-8" : "justify-end")}>
        <FilterContents />
        {!isMobile && <VolumeRange player={player} />}
      </div>
      <SortAndMapListLength />
    </section>
  );
};

export default MapControlArea;
