"use client";
import { MapList } from "@/shared/map/list";
import { useMapListLayoutOption } from "@/store/user-options";
import { useMapListFilterQueryStates, useMapListSortQueryState } from "./controls/search-params";
import { store } from "./provider";

export const HomeMapList = () => {
  const layoutType = useMapListLayoutOption();
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();

  return <MapList atomStore={store} filterParams={filterParams} sortParams={sortParams} layoutType={layoutType} />;
};
