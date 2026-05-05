"use client";
import { MapList } from "@/components/shared/map/list";
import { useMapListLayoutTypeState } from "@/lib/atoms/global-atoms";
import { useMapListFilterQueryStates, useMapListSortQueryState } from "./controls/search-params";
import { store } from "./provider";

export const HomeMapList = () => {
  const layoutType = useMapListLayoutTypeState();
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();

  return <MapList atomStore={store} filterParams={filterParams} sortParams={sortParams} layoutType={layoutType} />;
};
