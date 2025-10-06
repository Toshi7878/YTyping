import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useSetIsSearching } from "@/app/(home)/_lib/atoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { mapListSearchParams, type SortAndDirection, type SortFieldType } from "@/utils/queries/search-params/map-list";
import type { RANKING_STATUS_FILTER_MENU } from "./map-filter";

export const SortAndMapListLength = () => {
  return (
    <Card className="p-0">
      <CardContent className="p-1.5 flex flex-wrap items-center justify-between">
        <SortOptions />
        <MapListLengthBadge />
      </CardContent>
    </Card>
  );
};

type SortDirection = "asc" | "desc" | null;

const SORT_FIELDS = [
  { label: "ID", value: "id" },
  { label: "難易度", value: "difficulty" },
  { label: "ランキング数", value: "ranking-count" },
  { label: "いいね数", value: "like-count" },
  { label: "曲の長さ", value: "duration" },
  { label: "ランダム", value: "random" },
  { label: "いいね", value: "like" },
  { label: "記録登録日", value: "ranking-register" },
] as const satisfies { label: string; value: SortFieldType }[];

const parseSort = (sort: SortAndDirection | null): { value: SortFieldType; direction: SortDirection } => {
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

const SortOptions = () => {
  const [params, setParams] = useQueryStates(mapListSearchParams);
  const setIsSearching = useSetIsSearching();

  const currentSort = parseSort(params.sort);

  const handleSort = (value: SortFieldType) => {
    let nextSort: SortAndDirection | null = null;
    if (value === "random") {
      nextSort = currentSort.value === "random" ? null : "random";
    } else if (currentSort.value !== value) {
      nextSort = `${value}_desc`;
    } else if (currentSort.direction === "desc") {
      nextSort = `${value}_asc`;
    } else {
      nextSort = null;
    }

    setIsSearching(true);
    setParams({ sort: nextSort }, { history: "replace" });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 select-none">
      {SORT_FIELDS.map(({ label, value }) => {
        const filterLiked = params.filter === "liked";
        if (value === "like" && !filterLiked) return null;

        const rankingRegisteredStatus: (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"][] = [
          "1st",
          "not-first",
          "registerd",
          "perfect",
        ];

        const isFilterRankingRegistered = rankingRegisteredStatus.includes(
          params.rankingStatus as (typeof rankingRegisteredStatus)[number],
        );

        if (value === "ranking-register" && !isFilterRankingRegistered) return null;

        return (
          <Button
            variant="ghost"
            key={value}
            className={cn(
              "group transition-none text-base gap-1",
              currentSort.value === value && "text-secondary-light bg-accent font-bold hover:text-secondary-light",
            )}
            onClick={() => handleSort(value)}
          >
            <span>{label}</span>
            <SortIcon value={value} currentSort={currentSort} />
          </Button>
        );
      })}
    </div>
  );
};

interface SortIconProps {
  value: SortFieldType;
  currentSort: { value: SortFieldType; direction: SortDirection };
}

const SortIcon = ({ value, currentSort }: SortIconProps) => {
  if (value === "random") {
    return <FaSort className={cn(currentSort.value === "random" ? "visible" : "invisible", "group-hover:visible")} />;
  }
  if (currentSort.value === value && currentSort.direction === "asc") return <FaSortUp />;
  if (currentSort.value === value && currentSort.direction === "desc") return <FaSortDown />;
  return <FaSortDown className="invisible group-hover:visible" />;
};

const MapListLengthBadge = () => {
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
