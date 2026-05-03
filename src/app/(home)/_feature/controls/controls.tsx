"use client";
import { VolumeRange } from "@/components/shared/volume-range";
import { CardWithContent } from "@/components/ui/card";
import { usePreviewPlayerState } from "@/lib/atoms/global-atoms";
import { useSession } from "@/lib/auth-client";
import { DifficultyFilter } from "./difficulty-filter";
import { KeywordInput } from "./keyword";
import { MapCountBadge } from "./list-count";
import { SortControls } from "./sort";
import { MapListTagFilter } from "./tag-filter";
import { MapListLayoutModeSelector } from "./view-mode";

export const MapListControls = () => {
  const YTPlayer = usePreviewPlayerState();
  const { data: session } = useSession();
  const isLogin = !!session?.user?.id;

  return (
    <section className="flex w-full flex-col gap-3">
      <KeywordInput />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        {isLogin && <MapListTagFilter />}
        <DifficultyFilter />
      </div>
      <CardWithContent className={{ card: "p-0", cardContent: "flex flex-wrap items-center justify-between p-1.5" }}>
        <SortControls />
        <div className="flex items-center gap-3">
          <VolumeRange YTPlayer={YTPlayer} size="sm" sliderClassName="w-[140px]" />
          {isLogin && <MapListLayoutModeSelector className="hidden lg:flex" />}
          <MapCountBadge />
        </div>
      </CardWithContent>
    </section>
  );
};
