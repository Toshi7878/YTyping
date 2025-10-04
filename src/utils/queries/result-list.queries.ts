import { useTRPC } from "@/trpc/provider";
import { parseResultListSearchParams } from "./search-params/result-list";

export const useResultListInfiniteQueryOptions = (searchParams: URLSearchParams) => {
  const trpc = useTRPC();
  const params = parseResultListSearchParams(searchParams);

  return trpc.result.getAllWithMap.infiniteQueryOptions(params, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
    gcTime: Infinity,
  });
};
