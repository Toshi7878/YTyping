import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type MapListSortSearchParams,
  useMapListFilterQueryStates,
  useMapListSortQueryState,
} from "@/lib/search-params/map-list";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import type { MAP_SORT_OPTIONS } from "@/validator/map-list";
import { useSetSearchParams } from "../../_lib/use-set-search-params";
import type { RANKING_STATUS_FILTER_MENU } from "./map-filter";

export const SortControlsAndMapCount = () => {
  return (
    <Card className="p-0">
      <CardContent className="flex flex-wrap items-center justify-between p-1.5">
        <SortControls />
        <MapCountBadge />
      </CardContent>
    </Card>
  );
};

const SORT_OPTIONS: { label: string; value: (typeof MAP_SORT_OPTIONS)[number] }[] = [
  { label: "ID", value: "id" },
  { label: "難易度", value: "difficulty" },
  { label: "ランキング数", value: "ranking-count" },
  { label: "いいね数", value: "like-count" },
  { label: "曲の長さ", value: "duration" },
  { label: "ランダム", value: "random" },
  { label: "いいね", value: "like" },
  { label: "記録登録日", value: "ranking-register" },
  { label: "ブックマーク", value: "bookmark" },
];

const SortControls = () => {
  const setSearchParams = useSetSearchParams();
  const [params] = useMapListFilterQueryStates();
  const [currentSort] = useMapListSortQueryState();

  const deriveNextSortParam = (value: (typeof MAP_SORT_OPTIONS)[number]): MapListSortSearchParams | undefined => {
    if (value === "random") {
      return currentSort.value === "random" ? { value: "id", desc: true } : { value: "random", desc: false };
    }
    if (currentSort.value !== value) {
      return { value, desc: true };
    }
    if (currentSort.desc) {
      return { value, desc: false };
    }

    return { value: "id", desc: true };
  };

  return (
    <div className="flex select-none flex-wrap items-center gap-1">
      {SORT_OPTIONS.map(({ label, value }) => {
        const isLikedFilterActive = params.filter === "liked";
        if (value === "like" && !isLikedFilterActive) return null;

        const RANKING_STATUS_FOR_REGISTER_SORT: (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"][] = [
          "1st",
          "not-first",
          "registerd",
          "perfect",
        ];

        const rs = params.rankingStatus;
        const isRegisterSortAvailable = rs !== null && RANKING_STATUS_FOR_REGISTER_SORT.includes(rs);
        if (value === "ranking-register" && !isRegisterSortAvailable) return null;

        const isBookmarkSortAvailable = params.bookmarkListId !== null;
        if (value === "bookmark" && !isBookmarkSortAvailable) return null;

        return (
          <Button
            variant="ghost"
            key={value}
            className={cn(
              "group gap-1 text-base transition-none",
              currentSort.value === value && "bg-accent font-bold text-secondary-light hover:text-secondary-light",
            )}
            onClick={() => {
              const nextSort = deriveNextSortParam(value);
              setSearchParams({ sort: nextSort });
            }}
          >
            <span>{label}</span>
            <SortIndicator value={value} currentSort={currentSort} />
          </Button>
        );
      })}
    </div>
  );
};

interface SortIndicatorProps {
  value: (typeof MAP_SORT_OPTIONS)[number];
  currentSort: { value: (typeof MAP_SORT_OPTIONS)[number]; desc: boolean };
}

const SortIndicator = ({ value, currentSort }: SortIndicatorProps) => {
  if (value === "random") {
    return <FaSort className={cn(currentSort.value === "random" ? "visible" : "invisible", "group-hover:visible")} />;
  }
  if (currentSort.value === value && !currentSort.desc) return <FaSortUp />;
  if (currentSort.value === value && currentSort.desc) return <FaSortDown />;
  return <FaSortDown className="invisible group-hover:visible" />;
};

const MapCountBadge = () => {
  const trpc = useTRPC();
  const [params] = useMapListFilterQueryStates();
  const { data: mapListLength, isPending } = useQuery(trpc.map.list.getCount.queryOptions(params));

  return (
    <Badge variant="accent-light" className="gap-4" size="md">
      <span>譜面数:</span>
      <div className="flex w-6 min-w-6 items-center justify-end">
        {isPending ? <Loader2 className="size-5 animate-spin" /> : mapListLength}
      </div>
    </Badge>
  );
};
