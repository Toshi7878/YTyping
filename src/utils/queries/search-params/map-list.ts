export const PARAM_NAME = {
  keyword: "keyword",
  minRate: "minRate",
  maxRate: "maxRate",
  sort: "sort",
  filter: "filter",
  rankingStatus: "rankingStatus",
} as const;

type MapListParams = Partial<Record<keyof typeof PARAM_NAME, string>>;

export function parseMapListSearchParams(searchParams: URLSearchParams) {
  const params: MapListParams = {};

  for (const [key, value] of searchParams.entries()) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return {
    filter: params.filter,
    minRate: params.minRate ? Number(params.minRate) : undefined,
    maxRate: params.maxRate ? Number(params.maxRate) : undefined,
    rankingStatus: params.rankingStatus,
    keyword: params.keyword,
    sort: params.sort,
  };
}
