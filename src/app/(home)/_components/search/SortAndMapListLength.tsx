import { useReadDifficultyRange, useSetIsSearching } from "@/app/(home)/_lib/atoms";
import { useDifficultyRangeParams } from "@/app/(home)/_lib/useDifficultyRangeParams";
import { cn } from "@/lib/utils";
import { useMapListQueryOptions } from "@/utils/queries/mapList.queries";
import { PARAM_NAME } from "@/utils/queries/search-params/mapList";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

const SortAndMapListLength = () => {
  return (
    <div className="bg-card flex w-full flex-wrap items-center justify-between gap-1 overflow-x-auto rounded-md p-2 md:flex-nowrap">
      <SortOptions />
      <MapListLength />
    </div>
  );
};

export default SortAndMapListLength;

type SortField = keyof typeof FIELD_TO_PARAMS;
type SortDirection = "asc" | "desc" | null;

const FIELD_TO_PARAMS = {
  ID: "id" as const,
  難易度: "difficulty" as const,
  ランキング数: "ranking_count" as const,
  いいね数: "like_count" as const,
  曲の長さ: "duration" as const,
  ランダム: "random" as const,
  いいね: "like" as const,
};

const getResetDirections = (): Record<SortField, SortDirection> => ({
  ID: null,
  難易度: null,
  ランキング数: null,
  いいね数: null,
  曲の長さ: null,
  ランダム: null,
  いいね: null,
});

const SortOptions = () => {
  const searchParams = useSearchParams();
  const setIsSearching = useSetIsSearching();
  const setDifficultyRangeParams = useDifficultyRangeParams();
  const readDifficultyRange = useReadDifficultyRange();

  const [sortDirections, setSortDirections] = useState<Record<SortField, SortDirection>>(() => {
    const paramValue = searchParams.get(PARAM_NAME.sort);
    const [direction] = paramValue?.match(/asc|desc/) || ["desc"];
    const [field] = Object.entries(FIELD_TO_PARAMS).find(([_, value]) => paramValue?.includes(value)) || ["ID"];
    return {
      ...getResetDirections(),
      [field as SortField]: direction as SortDirection,
    };
  });

  useEffect(() => {
    const paramValue = searchParams.get(PARAM_NAME.sort);
    const [direction] = paramValue?.match(/asc|desc/) || ["desc"];
    const [field] = Object.entries(FIELD_TO_PARAMS).find(([_, value]) => paramValue?.includes(value)) || ["ID"];
    setSortDirections({ ...getResetDirections(), [field as SortField]: direction as SortDirection });
  }, [searchParams]);

  const handleSort = (field: SortField) => {
    const currentDirection = sortDirections[field];
    const params = new URLSearchParams(searchParams.toString());

    if (currentDirection === null) {
      if (field === "ID") {
        params.delete(PARAM_NAME.sort);
      } else if (field === "ランダム") {
        params.set(PARAM_NAME.sort, "random");
      } else {
        params.set(PARAM_NAME.sort, `${FIELD_TO_PARAMS[field]}_desc`);
      }
      setSortDirections({ ...getResetDirections(), [field]: "desc" });
    } else if (currentDirection === "desc" && field !== "ランダム") {
      params.set(PARAM_NAME.sort, `${FIELD_TO_PARAMS[field]}_asc`);
      setSortDirections({ ...getResetDirections(), [field]: "asc" });
    } else {
      params.delete(PARAM_NAME.sort);
      setSortDirections({ ...getResetDirections(), ID: "desc" });
    }

    setIsSearching(true);
    window.history.pushState(null, "", `?${setDifficultyRangeParams(params, readDifficultyRange()).toString()}`);
  };

  const getSortIcon = (field: SortField) => {
    if (field === "ランダム") {
      return <FaSort className={cn(sortDirections[field] ? "visible" : "invisible", "group-hover:visible")} />;
    }

    const direction = sortDirections[field];
    if (direction === "asc") return <FaSortUp />;
    if (direction === "desc") return <FaSortDown />;
    return <FaSortDown className="invisible group-hover:visible" />;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 select-none">
      {Object.keys(FIELD_TO_PARAMS).map((option) => {
        const isLikedSort = option === "いいね";
        const isFilterLiked = searchParams.get("filter") === "liked";
        if (isLikedSort && !isFilterLiked) {
          return null;
        }
        return (
          <div
            key={option}
            className={cn(
              "group hover:bg-accent flex cursor-pointer items-center justify-center rounded-sm px-3 py-1",
              sortDirections[option as SortField] ? "text-secondary-light bg-accent font-bold" : "font-normal",
            )}
            onClick={() => handleSort(option as SortField)}
          >
            <span className="mr-1">{option}</span>
            {getSortIcon(option as SortField)}
          </div>
        );
      })}
    </div>
  );
};

const MapListLength = () => {
  const searchParams = useSearchParams();

  const { data: mapListLength, isPending } = useQuery(useMapListQueryOptions().listLength(searchParams));

  return (
    <div className="bg-accent text-accent-foreground flex items-center gap-2 rounded-md px-3 py-1 font-medium">
      <span>譜面数:</span>
      <div className="flex w-6 min-w-6 items-center justify-end">
        {isPending ? <Loader2 className="h-4 w-4" /> : mapListLength}
      </div>
    </div>
  );
};
