"use client";
import { ResultList } from "@/components/shared/result/list";
import { useResultListFilterQueryStates } from "./search-params";

export const TimelineResultList = () => {
  const [filterParams] = useResultListFilterQueryStates();
  return <ResultList filterParams={filterParams} />;
};
