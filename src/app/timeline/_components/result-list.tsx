"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { ResultCard } from "@/components/shared/result-card/card";
import { Spinner } from "@/components/ui/spinner";
import { resultListSearchParams } from "@/lib/search-params/result-list";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/intersection";
import { setIsSearching, useIsSearchingState } from "../_lib/atoms";

export const UsersResultList = () => {
  const trpc = useTRPC();
  const [searchParams] = useQueryStates(resultListSearchParams);
  const isSearching = useIsSearchingState();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    trpc.resultList.getWithMap.infiniteQueryOptions(searchParams, {
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

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage });
  return (
    <section className={cn("grid grid-cols-1 gap-3", isSearching && "opacity-20")}>
      {data.pages.map((page, pageIndex) =>
        page.items.map((result) => (
          <ResultCard key={result.id} result={result} initialInView={data.pages.length - 1 === pageIndex} />
        )),
      )}
      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};
