import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useReadDifficultyRange, useSetIsSearching } from "@/app/(home)/_lib/atoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { mapListSearchParams, type SortAndDirection, type SortFieldType } from "@/utils/queries/search-params/map-list";
import type { RANKING_STATUS_FILTER_MENU } from "./map-filter";

export const SortControlsAndMapCount = () => {
  return (
    <Card className="p-0">
      <CardContent className="p-1.5 flex flex-wrap items-center justify-between">
        <SortControls />
        <MapCountBadge />
      </CardContent>
    </Card>
  );
};

const SORT_OPTIONS: { label: string; value: SortFieldType }[] = [
  { label: "ID", value: "id" },
  { label: "難易度", value: "difficulty" },
  { label: "ランキング数", value: "ranking-count" },
  { label: "いいね数", value: "like-count" },
  { label: "曲の長さ", value: "duration" },
  { label: "ランダム", value: "random" },
  { label: "いいね", value: "like" },
  { label: "記録登録日", value: "ranking-register" },
];

type SortDirection = "asc" | "desc" | null;
const parseSortParam = (sort: SortAndDirection | null): { value: SortFieldType; direction: SortDirection } => {
  switch (sort) {
    case "random":
      return { value: "random", direction: null };
    case "id_asc":
      return { value: "id", direction: "asc" };
    case "id_desc":
      return { value: "id", direction: "desc" };
    case "difficulty_asc":
      return { value: "difficulty", direction: "asc" };
    case "difficulty_desc":
      return { value: "difficulty", direction: "desc" };
    case "ranking-count_asc":
      return { value: "ranking-count", direction: "asc" };
    case "ranking-count_desc":
      return { value: "ranking-count", direction: "desc" };
    case "ranking-register_asc":
      return { value: "ranking-register", direction: "asc" };
    case "ranking-register_desc":
      return { value: "ranking-register", direction: "desc" };
    case "like-count_asc":
      return { value: "like-count", direction: "asc" };
    case "like-count_desc":
      return { value: "like-count", direction: "desc" };
    case "duration_asc":
      return { value: "duration", direction: "asc" };
    case "duration_desc":
      return { value: "duration", direction: "desc" };
    case "like_asc":
      return { value: "like", direction: "asc" };
    case "like_desc":
      return { value: "like", direction: "desc" };
    default:
      return { value: "id", direction: "desc" };
  }
};

const SortControls = () => {
  const [params, setParams] = useQueryStates(mapListSearchParams);
  const setIsSearching = useSetIsSearching();
  const readDifficultyRange = useReadDifficultyRange();

  const currentSortState = parseSortParam(params.sort);

  const deriveNextSortParam = (value: SortFieldType): SortAndDirection | null => {
    if (value === "random") {
      return currentSortState.value === "random" ? null : "random";
    }
    if (currentSortState.value !== value) {
      return `${value}_desc`;
    }
    if (currentSortState.direction === "desc") {
      return `${value}_asc`;
    }

    return null;
  };

  return (
    <div className="flex flex-wrap items-center gap-1 select-none">
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

        return (
          <Button
            variant="ghost"
            key={value}
            className={cn(
              "group transition-none text-base gap-1",
              currentSortState.value === value && "text-secondary-light bg-accent font-bold hover:text-secondary-light",
            )}
            onClick={() => {
              const nextSort = deriveNextSortParam(value);
              setIsSearching(true);
              setParams({ sort: nextSort, ...readDifficultyRange() }, { history: "replace" });
            }}
          >
            <span>{label}</span>
            <SortIndicator value={value} currentSort={currentSortState} />
          </Button>
        );
      })}
    </div>
  );
};

interface SortIndicatorProps {
  value: SortFieldType;
  currentSort: { value: SortFieldType; direction: SortDirection };
}

const SortIndicator = ({ value, currentSort }: SortIndicatorProps) => {
  if (value === "random") {
    return <FaSort className={cn(currentSort.value === "random" ? "visible" : "invisible", "group-hover:visible")} />;
  }
  if (currentSort.value === value && currentSort.direction === "asc") return <FaSortUp />;
  if (currentSort.value === value && currentSort.direction === "desc") return <FaSortDown />;
  return <FaSortDown className="invisible group-hover:visible" />;
};

const MapCountBadge = () => {
  const trpc = useTRPC();
  const [params] = useQueryStates(mapListSearchParams);
  const { sort: _, ...queryParams } = params;
  const { data: mapListLength, isPending } = useQuery(trpc.mapList.getListLength.queryOptions(queryParams));

  return (
    <Badge variant="accent-light" className="gap-4" size="md">
      <span>譜面数:</span>
      <div className="flex w-6 min-w-6 items-center justify-end">
        {isPending ? <Loader2 className="size-5 animate-spin" /> : mapListLength}
      </div>
    </Badge>
  );
};
