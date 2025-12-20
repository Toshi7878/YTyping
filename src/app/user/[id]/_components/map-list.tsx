"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { MapCard } from "@/components/shared/map-card/card";
import { useTRPC } from "@/trpc/provider";

export const UserCreatedMapList = ({ id }: { id: string }) => {
  const trpc = useTRPC();

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.mapList.get.infiniteQueryOptions(
      { creatorId: Number(id) },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page, pageIndex) =>
          page.items.map((map) => (
            <MapCard key={map.id} map={map} initialInView={data.pages.length - 1 === pageIndex} />
          )),
        )}
      </div>
      <InfiniteScrollSpinner {...pagination} />
    </section>
  );
};

export const UserLikedMapList = ({ id }: { id: string }) => {
  const trpc = useTRPC();

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.mapList.get.infiniteQueryOptions(
      { likerId: Number(id) },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page, pageIndex) =>
          page.items.map((map) => (
            <MapCard key={map.id} map={map} initialInView={data.pages.length - 1 === pageIndex} />
          )),
        )}
      </div>
      <InfiniteScrollSpinner {...pagination} />
    </section>
  );
};
