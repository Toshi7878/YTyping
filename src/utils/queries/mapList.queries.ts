import { PARAM_NAME } from "@/app/(home)/_lib/const";
import { useTRPC } from "@/trpc/provider";

export const useMapListQueryOptions = () => {
  const trpc = useTRPC();

  return {
    infiniteList: (searchParams: URLSearchParams) => {
      const params = getMapListSearchParams(searchParams);

      return trpc.mapList.getList.infiniteQueryOptions(params, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      });
    },

    listByVideoId: ({ videoId }: { videoId: string }) => trpc.mapList.getByVideoId.queryOptions({ videoId }),

    listLength: (searchParams: URLSearchParams) => {
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

export function getMapListSearchParams(searchParams: URLSearchParams) {
  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return {
    filter: params.filter,
    minRate: params.minRate ? Number(params.minRate) : undefined,
    maxRate: params.maxRate ? Number(params.maxRate) : undefined,
    played: params.played,
    keyword: params.keyword ?? "",
    sort: params.sort,
  };
}
