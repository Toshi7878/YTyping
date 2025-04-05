import { PAGE_SIZE, PARAM_NAME } from "@/app/(home)/ts/consts";
import { QUERY_KEYS } from "@/config/consts/globalConst";
import { RouterOutPuts } from "@/server/api/trpc";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type MapCardInfo = RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
export type MapListResponse = { maps: MapCardInfo[]; mapListLength?: number };

const fetchMapList = async ({
  page,
  session,
  ...params
}: { page: number; session: Session | null } & Partial<typeof PARAM_NAME>): Promise<MapListResponse> => {
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
  const { queryKey, params } = useGetMapListSearchParams();

  return useSuspenseInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => fetchMapList({ page: pageParam, session, ...params }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.maps.length === PAGE_SIZE ? allPages.length : undefined),
    getPreviousPageParam: (firstPage, allPages) => (allPages.length > 1 ? allPages.length - 2 : undefined),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    gcTime: Infinity,
    staleTime: params.sort?.includes("random") ? Infinity : 1000 * 20,
  });
};

function useGetMapListSearchParams() {
  const searchParams = useSearchParams();

  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return { queryKey: [...QUERY_KEYS.mapList, ...Object.values(params)], params: params };
}
