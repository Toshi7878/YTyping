"use client";
import Spinner from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { useResultListInfiniteQueryOptions } from "@/utils/queries/resultList.queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";
import ResultCard from "./result-card/ResultCard";

function UsersResultList({ list }: { list: RouterOutPuts["result"]["usersResultList"] }) {
  const searchParams = useSearchParams();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...useResultListInfiniteQueryOptions(searchParams),
    initialData: { pages: [list], pageParams: [null] },
    initialPageParam: null,
  });

  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "2000px 0px",
  });

  useEffect(() => {
    if (data) {
      setIsSearching(false);
    }
  }, [data, setIsSearching]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className={cn("grid grid-cols-1 gap-3", isSearching ? "opacity-20" : "opacity-100")}>
      {data.pages.map((page) => page.items.map((result) => <ResultCard key={result.id} result={result} />))}
      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
}

export default UsersResultList;
