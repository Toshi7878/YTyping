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
  };
};
