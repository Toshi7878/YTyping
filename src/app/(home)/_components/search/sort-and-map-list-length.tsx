import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { useSetIsSearching } from "@/app/(home)/_lib/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { mapListSearchParams, type SortFieldType } from "@/utils/queries/search-params/map-list";
import type { RANKING_STATUS_FILTER_MENU } from "./map-filter";

export const SortAndMapListLength = () => {
  return (
    <div className="bg-card flex w-full flex-wrap items-center justify-between gap-1 overflow-x-auto rounded-md p-2 md:flex-nowrap">
      <SortOptions />
      <MapListLength />
    </div>
  );
};

type SortDirection = "asc" | "desc" | null;

const SORT_FIELDS = [
  { label: "ID", value: "id" },
  { label: "難易度", value: "difficulty" },
  { label: "ランキング数", value: "ranking_count" },
  { label: "いいね数", value: "like_count" },
  { label: "曲の長さ", value: "duration" },
  { label: "ランダム", value: "random" },
  { label: "いいね", value: "like" },
  { label: "記録登録日", value: "ranking_register" },
] as const satisfies { label: string; value: SortFieldType }[];

const getResetDirections = () => Object.fromEntries(SORT_FIELDS.map((s) => [s.label, null]));

const getValueByLabel = (label: string): SortFieldType | undefined => SORT_FIELDS.find((s) => s.label === label)?.value;

const getLabelByValue = (value?: string | null): string =>
  SORT_FIELDS.find((s) => (value ?? "").includes(s.value))?.label ?? "ID";

const SortOptions = () => {
  const [params, setParams] = useQueryStates(mapListSearchParams);
  const setIsSearching = useSetIsSearching();

  const [sortDirections, setSortDirections] = useState<Record<string, SortDirection>>(() => {
    const paramValue = params.sort;
    const [direction] = paramValue?.match(/asc|desc/) || ["desc"];
    const field = getLabelByValue(paramValue);
    return { ...getResetDirections(), [field]: direction as SortDirection };
  });

  useEffect(() => {
    const paramValue = params.sort;
    const [direction] = paramValue?.match(/asc|desc/) || ["desc"];
    const field = getLabelByValue(paramValue);
    setSortDirections({ ...getResetDirections(), [field]: direction as SortDirection });
  }, [params.sort]);

  const handleSort = (field: (typeof SORT_FIELDS)[number]["label"]) => {
    const currentDirection = sortDirections[field];
    const value = getValueByLabel(field);

    let nextSort: string | null = null;
    if (currentDirection === null) {
      if (field === "ID") {
        nextSort = null;
      } else if (value === "random") {
        nextSort = "random";
      } else {
        nextSort = `${value}_desc`;
      }

      setSortDirections({ ...getResetDirections(), [field]: "desc" });
    } else if (currentDirection === "desc" && value !== "random") {
      nextSort = `${value}_asc`;
      setSortDirections({ ...getResetDirections(), [field]: "asc" });
    } else {
      nextSort = null;
      setSortDirections({ ...getResetDirections(), ID: "desc" });
    }

    setIsSearching(true);
    setParams({ sort: (nextSort as typeof params.sort) ?? null }, { history: "replace" });
  };

  const getSortIcon = (field: (typeof SORT_FIELDS)[number]["label"]) => {
    const value = getValueByLabel(field);
    if (value === "random") {
      return <FaSort className={cn(sortDirections[field] ? "visible" : "invisible", "group-hover:visible")} />;
    }

    const direction = sortDirections[field];
    if (direction === "asc") return <FaSortUp />;
    if (direction === "desc") return <FaSortDown />;
    return <FaSortDown className="invisible group-hover:visible" />;
  };

  return (
    <div className="flex flex-wrap items-center gap-1 xl:gap-2 select-none">
      {SORT_FIELDS.map(({ label, value }) => {
        const filterLiked = params.filter === "liked";
        if (value === "like" && !filterLiked) return null;

        const rankingRegisteredStatus = [
          "1st",
          "not-first",
          "registerd",
          "unregisterd",
          "perfect",
        ] satisfies (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"][];

        const isFilterRankingRegistered = rankingRegisteredStatus.includes(
          (params.rankingStatus ?? "") as (typeof rankingRegisteredStatus)[number],
        );

        if (value === "ranking_register" && !isFilterRankingRegistered) return null;

        return (
          <Button
            variant="ghost"
            key={label}
            className={cn(
              "group transition-none text-base gap-1",
              sortDirections[label] && "text-secondary-light bg-accent font-bold hover:text-secondary-light",
            )}
            onClick={() => handleSort(label)}
          >
            <span>{label}</span>
            {getSortIcon(label)}
          </Button>
        );
      })}
    </div>
  );
};

const MapListLength = () => {
  const trpc = useTRPC();
  const [params] = useQueryStates(mapListSearchParams);
  const { sort: _, ...queryParams } = params;
  const { data: mapListLength, isPending } = useQuery(trpc.mapList.getListLength.queryOptions(queryParams));

  return (
    <div className="bg-accent text-accent-foreground flex items-center gap-4 rounded-md px-3 py-1 font-medium">
      <span>譜面数:</span>
      <div className="flex w-6 min-w-6 items-center justify-end">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : mapListLength}
      </div>
    </div>
  );
};
