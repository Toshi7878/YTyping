"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { ResultCard } from "@/components/shared/result-card/card";
import { resultListFilterQueryStates } from "@/lib/search-params/result-list";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { setIsSearching, useIsSearchingState } from "../_lib/atoms";

export const UsersResultList = () => {
  const trpc = useTRPC();
  const [filterParams] = resultListFilterQueryStates();
  const isSearching = useIsSearchingState();

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.resultList.getWithMap.infiniteQueryOptions(filterParams, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  );

  useEffect(() => {
    if (data) {
      setIsSearching(false);
    }
  }, [data]);

  return (
    <section className={cn("grid grid-cols-1 gap-3", isSearching && "opacity-20")}>
      {data.pages.map((page, pageIndex) =>
        page.items.map((result) => (
          <ResultCard key={result.id} result={result} initialInView={data.pages.length - 1 === pageIndex} />
        )),
      )}
      <InfiniteScrollSpinner rootMarginVariant="resultListWithMap" {...pagination} />
    </section>
  );
};
