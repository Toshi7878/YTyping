"use client";
import { Box } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroller";
import { useUsersResultInfiniteQuery } from "../../../util/global-hooks/query/useUsersResultInfiniteQuery";
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
  const { data, fetchNextPage, hasNextPage } = useUsersResultInfiniteQuery();

  return (
    <Box as="section">
      <InfiniteScroll
        loadMore={() => fetchNextPage()}
        loader={<LoadingResultCard key="loading-more" cardLength={1} />}
        hasMore={hasNextPage}
        threshold={2000}
      >
        <ResultCardLayout>
          {data?.pages.map((page) => page.map((result) => <ResultCard key={result.id} result={result} />))}
        </ResultCardLayout>
      </InfiniteScroll>
    </Box>
  );
}

export default UsersResultList;
