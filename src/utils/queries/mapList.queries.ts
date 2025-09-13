import { PARAM_NAME } from "@/app/(home)/_lib/const";
import type { RouterOutPuts } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { ReadonlyURLSearchParams } from "next/navigation";

type MapCardInfo = RouterOutPuts["mapList"]["getByVideoId"][number];
export type MapListResponse = { maps: MapCardInfo[] };

export const useMapListQueryOptions = () => {
  const trpc = useTRPC();

  return {
    infiniteList: (searchParams: ReadonlyURLSearchParams) => {
      const params = getMapListSearchParams(searchParams);

      return trpc.mapList.getList.infiniteQueryOptions(
        {
          filter: params.filter,
          minRate: params.minRate ? Number(params.minRate) : undefined,
          maxRate: params.maxRate ? Number(params.maxRate) : undefined,
          played: params.played,
          keyword: params.keyword ?? "",
          sort: params.sort,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          refetchOnWindowFocus: false,
          gcTime: Infinity,
        },
      );
    },

    listByVideoId: ({ videoId }: { videoId: string }) => trpc.mapList.getByVideoId.queryOptions({ videoId }),

    listLength: (searchParams: ReadonlyURLSearchParams) => {
      const params = getMapListSearchParams(searchParams);

      return trpc.mapList.getListLength.queryOptions({
        filter: params.filter,
        minRate: params.minRate ? Number(params.minRate) : undefined,
        maxRate: params.maxRate ? Number(params.maxRate) : undefined,
        played: params.played,
        keyword: params.keyword ?? "",
      });
    },
  };
};

function getMapListSearchParams(searchParams: ReadonlyURLSearchParams) {
  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return params;
}
