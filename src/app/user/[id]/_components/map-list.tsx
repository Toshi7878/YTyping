"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { MapCard } from "@/components/shared/map-card/card";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/use-infinite-scroll";

export const UserCreatedMapList = ({ id }: { id: string }) => {
  const trpc = useTRPC();

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    trpc.mapList.getByCreatorId.infiniteQueryOptions(
      { userId: Number(id), sort: null },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage });
  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page) => page.items.map((map) => <MapCard key={map.id} map={map} />))}
      </div>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};

export const UserLikedMapList = ({ id }: { id: string }) => {
  const trpc = useTRPC();

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    trpc.mapList.getByLikedUserId.infiniteQueryOptions(
      { userId: Number(id), sort: null },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage });
  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page) => page.items.map((map) => <MapCard key={map.id} map={map} />))}
      </div>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};
