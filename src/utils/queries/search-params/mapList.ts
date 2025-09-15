export const PARAM_NAME = {
  keyword: "keyword",
  minRate: "minRate",
  maxRate: "maxRate",
  sort: "sort",
  filter: "filter",
  played: "played",
} as const;

export function parseMapListSearchParams(searchParams: URLSearchParams) {
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
