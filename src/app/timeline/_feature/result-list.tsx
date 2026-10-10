"use client";
import { ResultList } from "@/shared/result/list/list";
import { useResultListFilterQueryStates, useResultListSortQueryState } from "./search-params";

export const TimelineResultList = () => {
  const [filterParams] = useResultListFilterQueryStates();
  const [sort] = useResultListSortQueryState();
  return <ResultList filterParams={filterParams} sort={sort} />;
};
