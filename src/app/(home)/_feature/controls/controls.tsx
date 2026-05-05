"use client";
import { usePreviewYTPlayer } from "@/app/_layout/preview-youtube";
import { VolumeRange } from "@/components/shared/volume-range";
import { CardWithContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/tailwind";
import { DifficultyFilter } from "./difficulty-filter";
import { KeywordInput } from "./keyword";
import { MapCountBadge } from "./list-count";
import { SortControls } from "./sort";
import { MapListTagFilter } from "./tag-filter";
import { MapListLayoutModeSelector } from "./view-mode";

export const MapListControls = () => {
  const YTPlayer = usePreviewYTPlayer();
  const { data: session } = useSession();
  const isLogin = !!session?.user?.id;

  return (
    <section className="flex w-full flex-col gap-3">
      <KeywordInput />
      <div className="flex flex-col gap-3 sm:flex-row">
        {isLogin && <MapListTagFilter />}
        <DifficultyFilter className={cn(!isLogin && "lg:max-w-1/2")} />
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
