import { PAGE_SIZE, PARAM_NAME } from "@/app/timeline/_lib/consts";
import { infiniteQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { ReadonlyURLSearchParams } from "next/navigation";
import type { ResultCardInfo } from "../../app/timeline/_lib/type";
import { getBaseUrl } from "../getBaseUrl";
import { QUERY_KEYS } from "./const";

export const resultListQueries = {
  infiniteResultList: (searchParams: ReadonlyURLSearchParams) => {
    const { queryKey, params } = getSearchParams(searchParams);

    return infiniteQueryOptions({
      queryKey,
      queryFn: ({ pageParam = 0 }) =>
        getResultList({
          page: pageParam,
          params,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === PAGE_SIZE) {
          const nextPage = allPages.length;
          return nextPage;
        }

        return undefined;
      },
      getPreviousPageParam: (firstPage, allPages) => {
        if (allPages.length > 1) {
          return allPages.length - 2;
        }

        return undefined;
      },
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    });
  },
};

interface GetResultListParams {
  page: number;
  params?: Partial<typeof PARAM_NAME>;
}

async function getResultList({ page, params }: GetResultListParams): Promise<ResultCardInfo[]> {
  const response = await axios.get(`${getBaseUrl()}/api/users-result-list`, {
    params: {
      page,
      ...params,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch data");
  }

  return response.data;
}

function getSearchParams(searchParams: ReadonlyURLSearchParams) {
  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return { queryKey: [...QUERY_KEYS.usersResultList, ...Object.values(params)], params: params };
}
