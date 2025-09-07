import { PAGE_SIZE, PARAM_NAME } from "@/app/(home)/_lib/const";
import type { RouterOutPuts } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import axios from "axios";
import type { Session } from "next-auth";
import { ReadonlyURLSearchParams } from "next/navigation";
import { getBaseUrl } from "../getBaseUrl";
import { QUERY_KEYS } from "./const";

type MapCardInfo = RouterOutPuts["mapList"]["getByVideoId"][number];
export type MapListResponse = { maps: MapCardInfo[] };

export const useMapListQueryOptions = () => {
  const trpc = useTRPC();

  return {
    infiniteList: (session: Session | null, searchParams: ReadonlyURLSearchParams) => {
      const { queryKey, params } = getMapListSearchParams(searchParams);

      return infiniteQueryOptions({
        queryKey,
        queryFn: ({ pageParam = 0 }) => fetchMapList({ page: pageParam, session, params }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => (lastPage.maps.length === PAGE_SIZE ? allPages.length : undefined),
        getPreviousPageParam: (firstPage, allPages) => (allPages.length > 1 ? allPages.length - 2 : undefined),
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      });
    },

    listByVideoId: ({ videoId }: { videoId: string }) => trpc.mapList.getByVideoId.queryOptions({ videoId }),

    listLength: (session: Session | null, searchParams: ReadonlyURLSearchParams) => {
      const { queryKey, params } = getMapListSearchParams(searchParams);

      return queryOptions({
        queryKey: [...queryKey, "length"],
        queryFn: () => fetchMapListLength({ session, params }),
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        gcTime: Infinity,
      });
    },
  };
};

interface FetchMapListParams {
  page: number;
  session: Session | null;
  params: Partial<typeof PARAM_NAME>;
}

const fetchMapList = async ({ page, session, params }: FetchMapListParams): Promise<MapListResponse> => {
  try {
    const response = await axios.get(`${getBaseUrl()}/api/map-list`, {
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

const fetchMapListLength = async ({ session, params }: Omit<FetchMapListParams, "page">): Promise<number> => {
  try {
    const response = await axios.get(`${getBaseUrl()}/api/map-list-length`, {
      params: { userId: session?.user.id, ...params },
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

function getMapListSearchParams(searchParams: ReadonlyURLSearchParams) {
  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return { queryKey: [...QUERY_KEYS.mapList, ...Object.values(params)], params: params };
}
