"use client";
import Spinner from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { resultListQueries } from "@/utils/queries/resultList.queries";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";
import ResultCard from "./result-card/ResultCard";

function UsersResultList() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    resultListQueries.infiniteResultList(session, searchParams),
  );

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

  if (!data.pages) return null;

  return (
    <section className={cn("grid grid-cols-1 gap-3", isSearching ? "opacity-20" : "opacity-100")}>
      {data.pages.map((page) => page.map((result) => <ResultCard key={result.id} result={result} />))}
      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
}

export default UsersResultList;
