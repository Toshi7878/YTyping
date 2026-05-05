"use client";
import { useMapListLayoutOption } from "@/app/_layout/user-options";
import { MapList } from "@/components/shared/map/list";
import { useMapListFilterQueryStates, useMapListSortQueryState } from "./controls/search-params";
import { store } from "./provider";

export const HomeMapList = () => {
  const layoutType = useMapListLayoutOption();
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();

  return <MapList atomStore={store} filterParams={filterParams} sortParams={sortParams} layoutType={layoutType} />;
};
