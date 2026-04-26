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
    <section className="mb-4 flex w-full flex-col gap-4">
      <KeywordInput />
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:space-y-0">
        <div className="flex flex-col flex-wrap items-start gap-5 md:flex-row md:items-center">
          {isLogin && <MapListTagFilter />}
          <DifficultyFilter />
        </div>
        <VolumeRange YTPlayer={YTPlayer} />
      </div>
      <CardWithContent className={{ card: "p-0", cardContent: "flex flex-wrap items-center justify-between p-1.5" }}>
        <SortControls />
        <div className="flex items-center gap-2">
          {isLogin && <MapListLayoutModeSelector className="hidden lg:flex" />}
          <MapCountBadge />
        </div>
      </CardWithContent>
    </section>
  );
};
