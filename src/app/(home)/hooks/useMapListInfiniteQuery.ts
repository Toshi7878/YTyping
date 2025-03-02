import { QUERY_KEYS } from "@/config/consts/globalConst";
import { RouterOutPuts } from "@/server/api/trpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";

type MapCardInfo = RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];

// APIからマップリストを取得する関数
const fetchMapList = async (
  page: number,
  keyword: string,
  filter: string,
  sort: string
): Promise<MapCardInfo[]> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/map-list`, {
      params: { page, keyword, filter, sort },
    });

    if (response.status !== 200) {
      throw new Error("マップデータの取得に失敗しました");
    }

    return response.data;
  } catch (error) {
    console.error("マップリスト取得エラー:", error);
    throw error;
  }
};

// 1ページあたりの最大アイテム数
const PAGE_SIZE = 40;

export const useMapListInfiniteQuery = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const filter = searchParams.get("f") || "";
  const sort = searchParams.get("sort") || "";

  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.mapList, keyword, filter, sort],
    queryFn: ({ pageParam = 0 }) => fetchMapList(pageParam, keyword, filter, sort),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    getPreviousPageParam: (firstPage, allPages) =>
      allPages.length > 1 ? allPages.length - 2 : undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    gcTime: Infinity,
  });
};
