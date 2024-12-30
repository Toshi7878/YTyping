"use client";
import InfiniteScroll from "react-infinite-scroller";
import ResultCard from "./result-card/ResultCard";
import ResultCardLayout from "./result-card/ResultCardLayout";
import { useUsersResultInfiniteQuery } from "../hooks/useUsersResultInfiniteQuery";
import { Box } from "@chakra-ui/react";
import SearchContent from "./search/SearchContent";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import nProgress from "nprogress";

function UsersResultList() {
  const {
    data,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    status,
    refetch,
  } = useUsersResultInfiniteQuery();

  const searchParams = useSearchParams();

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  useEffect(() => {
    if (!isFetching) {
      // ここに最初の取得に成功したときの処理を追加
      nProgress.done();
    }
  }, [isFetching]);

  return (
    <Box as="section">
      <SearchContent />

      <InfiniteScroll
        loadMore={() => fetchNextPage()}
        // loader={<LoadingMapCard />}
        hasMore={hasNextPage}
        threshold={2000} // スクロールの閾値を追加
      >
        <ResultCardLayout>
          {data?.pages.map((page) =>
            page.map((result) => <ResultCard key={result.id} result={result} />),
          )}
        </ResultCardLayout>
      </InfiniteScroll>
    </Box>
  );
}

export default UsersResultList;
