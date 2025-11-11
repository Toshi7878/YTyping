"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { ResultCard } from "@/components/shared/result-card/card";
import { Spinner } from "@/components/ui/spinner";
import { resultListSearchParams } from "@/lib/search-params/result-list";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/use-infinite-scroll";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

export const UsersResultList = () => {
  const trpc = useTRPC();
  const [searchParams] = useQueryStates(resultListSearchParams);
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    trpc.result.getAllWithMap.infiniteQueryOptions(searchParams, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    }),
  );

  useEffect(() => {
    if (data) {
      setIsSearching(false);
    }
  }, [data, setIsSearching]);

  const ref = useInfiniteScroll(
    { isFetchingNextPage, fetchNextPage, hasNextPage },
    { threshold: 0, rootMargin: "2000px 0px" },
  );
  return (
    <section className={cn("grid grid-cols-1 gap-3", isSearching && "opacity-20")}>
      {data.pages.map((page) => page.items.map((result) => <ResultCard key={result.id} result={result} />))}
      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};
