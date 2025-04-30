import { PAGE_SIZE, PARAM_NAME } from "@/app/timeline/ts/const/consts";
import { QUERY_KEYS } from "@/config/consts/globalConst";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { ResultCardInfo } from "../../../app/timeline/ts/type";

interface GetResultListProps {
  page: number;
  params?: Partial<typeof PARAM_NAME>;
}

async function getResultList({ page, params }: GetResultListProps): Promise<ResultCardInfo[]> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users-result-list`, {
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

export const useUsersResultInfiniteQuery = () => {
  const { queryKey, params } = useGetSearchParams();

  return useSuspenseInfiniteQuery({
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
    gcTime: Infinity,
  });
};

function useGetSearchParams() {
  const searchParams = useSearchParams();

  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return { queryKey: [...QUERY_KEYS.usersResultList, ...Object.values(params)], params: params };
}
