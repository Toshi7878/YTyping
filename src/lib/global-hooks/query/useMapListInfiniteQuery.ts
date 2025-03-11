import { useGetMapListParams } from "@/app/(home)/hook/useGetMapListSearchParams";
import { MapListParams } from "@/app/(home)/ts/type";
import { QUERY_KEYS } from "@/config/consts/globalConst";
import { RouterOutPuts } from "@/server/api/trpc";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";

type MapCardInfo = RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];

// 1ページあたりの最大アイテム数
const PAGE_SIZE = 40;

const fetchMapList = async ({
  page,
  session,
  ...params
}: { page: number; session: Session | null } & MapListParams): Promise<MapCardInfo[]> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/map-list`, {
      params: { page, userId: session?.user.id, ...params },
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
  const { data: session } = useSession();
  const { queryKey, params } = generateMapListInfiniteQueryKey();

  return useSuspenseInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => fetchMapList({ page: pageParam, session, ...params }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    getPreviousPageParam: (firstPage, allPages) =>
      allPages.length > 1 ? allPages.length - 2 : undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5,
    gcTime: Infinity,
  });
};

export const generateMapListInfiniteQueryKey = () => {
  const queryParams = useGetMapListParams();

  return { queryKey: [...QUERY_KEYS.mapList, ...Object.values(queryParams)], params: queryParams };
};
