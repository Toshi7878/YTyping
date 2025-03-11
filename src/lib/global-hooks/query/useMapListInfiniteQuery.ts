import { QUERY_KEYS } from "@/config/consts/globalConst";
import { RouterOutPuts } from "@/server/api/trpc";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { MapListParams } from "../../../app/(home)/components/MapList";

type MapCardInfo = RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];

// 1ページあたりの最大アイテム数
const PAGE_SIZE = 40;

const fetchMapList = async ({
  page,
  ...params
}: { page: number } & MapListParams): Promise<MapCardInfo[]> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/map-list`, {
      params: { page, ...params },
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

export const useMapListInfiniteQuery = (queryParams: MapListParams) => {
  return useSuspenseInfiniteQuery({
    queryKey: [...QUERY_KEYS.mapList, ...Object.values(queryParams)],
    queryFn: ({ pageParam = 0 }) => fetchMapList({ page: pageParam, ...queryParams }),
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
