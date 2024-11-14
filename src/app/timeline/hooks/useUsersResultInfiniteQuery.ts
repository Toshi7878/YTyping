import { useInfiniteQuery } from "@tanstack/react-query";
import { FilterMode, ResultCardInfo } from "../ts/type";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useSearchResultKeyWordsAtom } from "../atoms/atoms";

interface GetResultListProps {
  page: number;
  mode: FilterMode;
  userKeyword: string;
  minKpm: number;
  maxKpm: number;
  minClearRate: number;
  maxClearRate: number;
  minSpeed: number;
  maxSpeed: number;
}

async function getResultList({
  page,
  mode,
  userKeyword,
  minKpm,
  maxKpm,
  minClearRate,
  maxClearRate,
  minSpeed,
  maxSpeed,
}: GetResultListProps): Promise<ResultCardInfo[]> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users-result-list`, {
    params: {
      page,
      mode,
      userKeyword,
      minKpm,
      maxKpm,
      minClearRate,
      maxClearRate,
      minSpeed,
      maxSpeed,
    }, // ページ数をクエリパラメータとして追加
    // cache: "no-cache", // キャッシュモード
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch data");
  }

  return response.data;
}

export const useUsersResultInfiniteQuery = () => {
  const searchParams = useSearchParams();
  const searchMode = (searchParams.get("mode") || "all") as FilterMode;
  const minKpm = Number(searchParams.get("min-kpm") || 0);
  const maxKpm = Number(searchParams.get("max-kpm") || 0);
  const minClearRate = Number(searchParams.get("min-clear-rate") || 0);
  const maxClearRate = Number(searchParams.get("max-clear-rate") || 0);
  const minSpeed = Number(searchParams.get("min-speed") || 1);
  const maxSpeed = Number(searchParams.get("max-speed") || 0);
  const userNameKeyword = searchParams.get("user-keyword") || "";

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
  } = useInfiniteQuery({
    queryKey: ["usersResultList", searchMode], // 修正: searchModeをqueryKeyに追加
    queryFn: ({ pageParam = 0 }) =>
      getResultList({
        page: pageParam,
        mode: searchMode,
        userKeyword: userNameKeyword,
        minKpm,
        maxKpm,
        minClearRate,
        maxClearRate,
        minSpeed,
        maxSpeed,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length > 0) {
        const nextPage = allPages.length;
        return nextPage;
      }

      return undefined;
    },
    getPreviousPageParam: (firstPage, allPages) => {
      // 前のページを取得するための処理
      if (allPages.length > 1) {
        return allPages.length - 2;
      }

      return undefined;
    },
    staleTime: Infinity, // データを常に新鮮に保つ
    refetchOnWindowFocus: false, // ウィンドウフォーカス時に再フェッチしない
    refetchOnReconnect: false, // 再接続時に再フェッチしない
    refetchOnMount: true,
  });

  return {
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
  };
};
