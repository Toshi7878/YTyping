"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ResultCard } from "@/components/shared/result-card/result-card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useResultListInfiniteQueryOptions } from "@/utils/queries/result-list.queries";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

export const UsersResultList = () => {
  const searchParams = useSearchParams();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    useResultListInfiniteQueryOptions(searchParams),
  );

  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();

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
    <section className={cn("grid grid-cols-1 gap-3", isSearching ? "opacity-20" : "opacity-100")}>
      {data.pages.map((page) => page.items.map((result) => <ResultCard key={result.id} result={result} />))}
      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};
