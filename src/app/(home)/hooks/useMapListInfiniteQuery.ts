import { QUERY_KEYS } from "@/config/consts";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { MapCardInfo } from "../ts/type";

async function getMapList(page: number, mapKeyword: string): Promise<MapCardInfo[]> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/map-list`, {
    params: { page, mapKeyword }, // ページ数をクエリパラメータとして追加
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch data");
  }

  return response.data;
}

export const useMapListInfiniteQuery = () => {
  const searchParams = useSearchParams();
  const mapKeyword = searchParams.get("map-keyword") || "";

  const mapListInfiniteQuery = useInfiniteQuery({
    queryKey: QUERY_KEYS.mapList,
    queryFn: ({ pageParam = 0 }) => getMapList(pageParam, mapKeyword), // ページ数を引数として渡す
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 40) {
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
    refetchOnWindowFocus: false, // ウィンドウフォーカス時に再フェッチしない
    refetchOnReconnect: false, // 再接続時に再フェッチしない
    refetchOnMount: false, // マウント時に再フェッチしない
  });

  return mapListInfiniteQuery;
};
