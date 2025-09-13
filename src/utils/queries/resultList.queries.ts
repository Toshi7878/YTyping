import { PAGE_SIZE, PARAM_NAME } from "@/app/timeline/_lib/consts";
import { infiniteQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import type { Session } from "next-auth";
import { ReadonlyURLSearchParams } from "next/navigation";
import type { TimelineResult } from "../../app/timeline/_lib/type";
import { getBaseUrl } from "../getBaseUrl";
import { QUERY_KEYS } from "./const";

export const resultListQueries = {
  infiniteResultList: (session: Session | null, searchParams: ReadonlyURLSearchParams) => {
    const { queryKey, params } = getSearchParams(searchParams);

    return infiniteQueryOptions({
      queryKey,
      queryFn: ({ pageParam = 0 }) => getResultList({ page: pageParam, session, params }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length : undefined),
      getPreviousPageParam: (firstPage, allPages) => (allPages.length > 1 ? allPages.length - 2 : undefined),
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    });
  },
};

interface GetResultListParams {
  page: number;
  session: Session | null;
  params?: Partial<typeof PARAM_NAME>;
}

async function getResultList({ page, session, params }: GetResultListParams): Promise<TimelineResult[]> {
  const response = await axios.get(`${getBaseUrl()}/api/users-result-list`, {
    params: { page, userId: session?.user.id, ...params },
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
