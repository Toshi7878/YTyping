import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE, PARAM_NAME } from "@/app/timeline/_lib/consts";
import { useTRPC } from "@/trpc/provider";

export const useResultListInfiniteQueryOptions = (searchParams: URLSearchParams) => {
  const trpc = useTRPC();
  const params = getSearchParams(searchParams);

  return trpc.result.usersResultList.infiniteQueryOptions(
    {
      mode: params.mode ?? "all",
      minKpm: params.minKpm ? Number(params.minKpm) : DEFAULT_KPM_SEARCH_RANGE.min,
      maxKpm: params.maxKpm ? Number(params.maxKpm) : DEFAULT_KPM_SEARCH_RANGE.max,
      minClearRate: params.minClearRate ? Number(params.minClearRate) : DEFAULT_CLEAR_RATE_SEARCH_RANGE.min,
      maxClearRate: params.maxClearRate ? Number(params.maxClearRate) : DEFAULT_CLEAR_RATE_SEARCH_RANGE.max,
      minPlaySpeed: params.minPlaySpeed ? Number(params.minPlaySpeed) : 1,
      maxPlaySpeed: params.maxPlaySpeed ? Number(params.maxPlaySpeed) : 2,
      username: params.username ?? "",
      mapKeyword: params.mapkeyword ?? "",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    },
  );
};

export function getSearchParams(searchParams: URLSearchParams) {
  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return params;
}
