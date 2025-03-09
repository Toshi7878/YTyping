"use client";
import { Box } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useUsersResultInfiniteQuery } from "../../../lib/global-hooks/query/useUsersResultInfiniteQuery";
import ResultCard from "./result-card/ResultCard";
import ResultCardLayout from "./result-card/ResultCardLayout";
import ResultSkeletonCard from "./result-card/ResultSkeletonCard";
import SearchContent from "./search/SearchContent";

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
  const { data, fetchNextPage, hasNextPage, status, refetch } = useUsersResultInfiniteQuery();

  const searchParams = useSearchParams();

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Box as="section">
      <SearchContent />

      {status === "pending" ? (
        <LoadingResultCard cardLength={10} />
      ) : (
        <InfiniteScroll
          loadMore={() => fetchNextPage()}
          loader={<LoadingResultCard key="loading-more" cardLength={1} />}
          hasMore={hasNextPage}
          threshold={2000} // スクロールの閾値を追加
        >
          <ResultCardLayout>
            {data?.pages.map((page) =>
              page.map((result) => <ResultCard key={result.id} result={result} />)
            )}
          </ResultCardLayout>
        </InfiniteScroll>
      )}
    </Box>
  );
}

export default UsersResultList;
