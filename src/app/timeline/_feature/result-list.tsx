"use client";
import { ResultList } from "@/shared/result/list/list";
import { useResultListFilterQueryStates } from "./search-params";

export const TimelineResultList = () => {
  const [filterParams] = useResultListFilterQueryStates();
  return <ResultList filterParams={filterParams} />;
};
