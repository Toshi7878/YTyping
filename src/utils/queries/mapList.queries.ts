import { useTRPC } from "@/trpc/provider";
import { parseMapListSearchParams } from "@/utils/queries/search-params/mapList";

export const useMapListQueryOptions = () => {
  const trpc = useTRPC();

  return {
    infiniteList: (searchParams: URLSearchParams) => {
      const params = parseMapListSearchParams(searchParams);

      return trpc.mapList.getList.infiniteQueryOptions(params, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      });
    },

    listByVideoId: ({ videoId }: { videoId: string }) => trpc.mapList.getByVideoId.queryOptions({ videoId }),

    listLength: (searchParams: URLSearchParams) => {
      const params = parseMapListSearchParams(searchParams);

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
