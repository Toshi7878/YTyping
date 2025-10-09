import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useReadPendingDifficultyRange } from "@/app/(home)/_lib/atoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import {
  type MapListSearchParams,
  mapListSearchParams,
  type SortFieldType,
} from "@/utils/queries/search-params/map-list";
import { useSetParams } from "../../_lib/use-set-params";
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

const SortControls = () => {
  const [params] = useQueryStates(mapListSearchParams);
  const readPendingDifficultyRange = useReadPendingDifficultyRange();
  const setParams = useSetParams();

  const currentSort = params.sort;

  const deriveNextSortParam = (value: SortFieldType): MapListSearchParams["sort"] | undefined => {
    if (value === "random") {
      return currentSort.id === "random" ? { id: "id", desc: true } : { id: "random", desc: false };
    }
    if (currentSort.id !== value) {
      return { id: value, desc: true };
    }
    if (currentSort.desc) {
      return { id: value, desc: false };
    }

    return { id: "id", desc: true };
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
              currentSort.id === value && "text-secondary-light bg-accent font-bold hover:text-secondary-light",
            )}
            onClick={() => {
              const nextSort = deriveNextSortParam(value);
              setParams({ sort: nextSort, ...readPendingDifficultyRange() });
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
  value: SortFieldType;
  currentSort: { id: SortFieldType; desc: boolean };
}

const SortIndicator = ({ value, currentSort }: SortIndicatorProps) => {
  if (value === "random") {
    return <FaSort className={cn(currentSort.id === "random" ? "visible" : "invisible", "group-hover:visible")} />;
  }
  if (currentSort.id === value && !currentSort.desc) return <FaSortUp />;
  if (currentSort.id === value && currentSort.desc) return <FaSortDown />;
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
