"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { MapCard } from "@/components/shared/map-card/card";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/provider";

export const BookmarkListDetailView = ({ id }: { id: string }) => {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/bookmarks" className="flex items-center gap-2">
          <ArrowLeft className="size-4" />
          ブックマーク一覧に戻る
        </Link>
      </Button>
      <BookmarkMapList listId={Number(id)} />
    </div>
  );
};

const BookmarkMapList = ({ listId }: { listId: number }) => {
  const trpc = useTRPC();

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.map.list.get.infiniteQueryOptions(
      { bookmarkListId: listId, sort: { value: "bookmark", desc: true } },
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
