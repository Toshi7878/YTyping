"use client";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useUsersResultInfiniteQuery } from "../../../util/global-hooks/query/useUsersResultInfiniteQuery";
import { useIsSearchingState, useSetIsSearching } from "../atoms/atoms";
import ResultCard from "./result-card/ResultCard";
import ResultCardLayout from "./result-card/ResultCardLayout";
import ResultSkeletonCard from "./result-card/ResultSkeletonCard";

function LoadingResultCard({ cardLength }: { cardLength: number }) {
  return (
    <ResultCardLayout>
      {[...Array(cardLength)].map((_, index) => (
        <ResultSkeletonCard key={index} />
      ))}
    </ResultCardLayout>
  );
}

function UsersResultList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useUsersResultInfiniteQuery();
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
    <section className={`${isSearching ? "opacity-20" : "opacity-100"}`}>
      <ResultCardLayout>
        {data?.pages.map((page) => page.map((result) => <ResultCard key={result.id} result={result} />))}
      </ResultCardLayout>

      {hasNextPage && (
        <div ref={ref}>
          <LoadingResultCard cardLength={1} />
        </div>
      )}
    </section>
  );
}

export default UsersResultList;
