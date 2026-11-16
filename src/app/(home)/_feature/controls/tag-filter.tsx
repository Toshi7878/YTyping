"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTranslations } from "next-intl";
import * as React from "react";
import type ja from "@/i18n/messages/ja.json";
import { orpc } from "@/orpc/provider";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select/select";
import { Slider } from "@/ui/slider";
import { cn } from "@/utils/cn";
import type { MAP_RANKING_STATUS_FILTER_OPTIONS, MAP_USER_FILTER_OPTIONS } from "@/validator/map/list";
import {
  type MapListFilterSearchParams,
  type MapListSortSearchParams,
  useMapListFilterQueryStates,
  useMapListSortQueryState,
} from "./search-params";

type FilterLabelKey = keyof (typeof ja)["home"]["filters"];

type FilterMenuConfig<K extends keyof MapListFilterSearchParams> = {
  name: K;
  labelKey: FilterLabelKey;
  options: {
    labelKey: FilterLabelKey;
    value: MapListFilterSearchParams[K];
  }[];
};

const USER_FILTER_MENU: FilterMenuConfig<"filterType"> = {
  name: "filterType",
  labelKey: "user",
  options: [
    { labelKey: "liked", value: "liked" },
    { labelKey: "created", value: "created" },
    { labelKey: "unlisted", value: "unlisted" },
  ] satisfies { labelKey: FilterLabelKey; value: (typeof MAP_USER_FILTER_OPTIONS)[number] }[],
};

export const RANKING_STATUS_FILTER_MENU: FilterMenuConfig<"rankingStatus"> = {
  name: "rankingStatus",
  labelKey: "ranking",
  options: [
    { labelKey: "first", value: "1st" },
    { labelKey: "notFirst", value: "not-first" },
    { labelKey: "registered", value: "registerd" },
    { labelKey: "unregistered", value: "unregisterd" },
    { labelKey: "perfect", value: "perfect" },
  ] satisfies { labelKey: FilterLabelKey; value: (typeof MAP_RANKING_STATUS_FILTER_OPTIONS)[number] }[],
};

export const MapListTagFilter = () => {
  return (
    <Card className="flex-1 select-none py-1 sm:max-w-1/2">
      <CardContent className="grid grid-cols-1 items-center sm:grid-cols-[auto_1fr]">
        <FilterMenu key={USER_FILTER_MENU.labelKey} filter={USER_FILTER_MENU}>
          <BookmarkListSelect />
        </FilterMenu>
        <FilterMenu key={RANKING_STATUS_FILTER_MENU.labelKey} filter={RANKING_STATUS_FILTER_MENU} />
        <GenreFilterRow />
      </CardContent>
    </Card>
  );
};

interface FilterMenuProps {
  filter: FilterMenuConfig<"filterType" | "rankingStatus">;
  children?: React.ReactNode;
}

const FilterMenu = ({ filter, children }: FilterMenuProps) => {
  const t = useTranslations("home.filters");
  const [params, setFilterParams] = useMapListFilterQueryStates();
  const [, setSortParam] = useMapListSortQueryState();

  return (
    <>
      <div className="flex h-6 min-w-0 items-center font-medium text-[11px] text-muted-foreground md:mr-3 md:min-w-[72px]">
        {t(filter.labelKey)}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {filter.options.map((param: (typeof filter.options)[number]) => {
          const currentValue = filter.name === "filterType" ? params.filterType : params.rankingStatus;
          const isActive = currentValue === param.value;

          return (
            <Button
              key={param.value}
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                const nextParams = getNextFilterParams(filter.name, param.value, !isActive, params);
                void setFilterParams(nextParams);
                void setSortParam(deriveSortParam(nextParams));
              }}
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] transition-none hover:underline",
                isActive && "bg-accent/40 font-bold text-secondary-light hover:text-secondary-light",
              )}
            >
              {t(param.labelKey)}
            </Button>
          );
        })}
        {children}
      </div>
    </>
  );
};

const BookmarkListSelect = () => {
  const t = useTranslations("home.filters");
  const { data: lists } = useSuspenseQuery(orpc.map.bookmark.lists.getForSession.queryOptions());
  const [params, setFilterParams] = useMapListFilterQueryStates();
  const [, setSortParam] = useMapListSortQueryState();

  const CLEAR_VALUE = "__clear__";
  const value = !params.bookmarkListId ? "" : String(params.bookmarkListId);

  return (
    <Select
      items={[
        { label: t("none"), value: CLEAR_VALUE },
        ...(lists?.map((list) => ({ label: list.title, value: list.id.toString() })) ?? []),
      ]}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === CLEAR_VALUE) {
          void setFilterParams({ ...params, bookmarkListId: null });
          void setSortParam(null);
          return;
        }
        void setFilterParams({ ...params, bookmarkListId: Number(nextValue) });
        void setSortParam({ type: "bookmark", isDesc: true });
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "w-36 font-normal text-[11px]",
          value && "font-bold text-secondary-light hover:text-secondary-light",
        )}
      >
        <SelectValue placeholder={t("bookmark")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CLEAR_VALUE}>{t("none")}</SelectItem>
        {lists?.map((list) => (
          <SelectItem key={list.id} value={list.id.toString()}>
            {list.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const GENRE_FILTERS = [
  {
    labelKey: "japanese",
    params: { englishRatio: 0 },
  },
  {
    labelKey: "english",
    params: { englishRatio: 100 },
  },
] as const;

const GENRE_FILTER_CLEAR = { englishRatio: null };

const GenreFilterRow = () => {
  const t = useTranslations("home.filters");
  const [params, setFilterParams] = useMapListFilterQueryStates();
  const isLanguageFilterActive = params.englishRatio !== null;
  const englishRatio = params.englishRatio ?? 0;
  const [localSlider, setLocalSlider] = React.useState(englishRatio);

  React.useEffect(() => {
    setLocalSlider(englishRatio);
  }, [englishRatio]);

  return (
    <>
      <div className="flex h-6 min-w-0 items-center font-medium text-[11px] text-muted-foreground md:mr-3 md:min-w-[72px]">
        {t("language")}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {GENRE_FILTERS.map((filter, index) => {
          const isActive = params.englishRatio === filter.params.englishRatio;

          return (
            <React.Fragment key={filter.labelKey}>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  void setFilterParams(isActive ? GENRE_FILTER_CLEAR : filter.params);
                }}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[11px] transition-none hover:underline",
                  isActive && "bg-accent/40 font-bold text-secondary-light hover:text-secondary-light",
                )}
              >
                {t(filter.labelKey)}
              </Button>
              {index === 0 && isLanguageFilterActive && (
                <div className="group relative flex min-w-40 flex-1 items-center px-2">
                  <Slider
                    min={0}
                    max={100}
                    step={10}
                    value={[localSlider]}
                    thumbLabel={(ratio) => t("languageRatio", { japanese: 100 - (ratio ?? 0), english: ratio ?? 0 })}
                    onValueChange={(v) => setLocalSlider(v[0] ?? 0)}
                    onValueCommitted={(v) => {
                      void setFilterParams({ englishRatio: v[0] ?? 0 });
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

const RANKING_REGISTERED_FILTER_OPTIONS: (typeof MAP_RANKING_STATUS_FILTER_OPTIONS)[number][] = [
  "1st",
  "not-first",
  "registerd",
  "perfect",
];

const deriveSortParam = ({
  filterType,
  rankingStatus,
}: Pick<MapListFilterSearchParams, "filterType" | "rankingStatus">): MapListSortSearchParams => {
  if (filterType === "liked") return { type: "like", isDesc: true };
  if (rankingStatus && RANKING_REGISTERED_FILTER_OPTIONS.includes(rankingStatus)) {
    return { type: "ranking-register", isDesc: true };
  }
  return { type: "publishedAt", isDesc: true };
};

const getNextFilterParams = (
  name: "filterType" | "rankingStatus",
  value:
    | (typeof USER_FILTER_MENU.options)[number]["value"]
    | (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"],
  isApply: boolean,
  params: MapListFilterSearchParams,
): Pick<MapListFilterSearchParams, "filterType" | "rankingStatus"> => {
  let selectedFilter = params.filterType;
  if (name === "filterType") {
    selectedFilter = isApply ? (value as typeof params.filterType) : null;
  }
  let selectedRankingStatus = params.rankingStatus;
  if (name === "rankingStatus") {
    selectedRankingStatus = isApply ? (value as typeof params.rankingStatus) : null;
  }
  return { filterType: selectedFilter, rankingStatus: selectedRankingStatus };
};
