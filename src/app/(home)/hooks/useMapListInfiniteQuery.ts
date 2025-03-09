import { QUERY_KEYS } from "@/config/consts/globalConst";
import { RouterOutPuts } from "@/server/api/trpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";

type MapCardInfo = RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];

type MapListParams = {
  keyword: string;
  filter: string;
  sort: string;
  maxRate: string;
  minRate: string;
  played: string;
};

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

export const useMapListInfiniteQuery = () => {
  const searchParams = useSearchParams();

  const queryParams: MapListParams = {
    keyword: searchParams.get("keyword") || "",
    filter: searchParams.get("f") || "",
    sort: searchParams.get("sort") || "",
    maxRate: searchParams.get("maxRate") || "",
    minRate: searchParams.get("minRate") || "",
    played: searchParams.get("played") || "",
  };

  return useInfiniteQuery({
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
