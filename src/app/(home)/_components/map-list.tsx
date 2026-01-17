"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { MapCard } from "@/components/shared/map-card/card";
import { CompactMapCard } from "@/components/shared/map-card/compact-card";
import { useMapListFilterQueryStates, useMapListSortQueryState } from "@/lib/search-params/map-list";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import { useTRPC } from "@/trpc/provider";
import { setIsSearching, useIsSearchingState, useListLayoutTypeState } from "../_lib/atoms";

const pageAtom = atom<number>(0);

export const MapList = () => {
  const isSearching = useIsSearchingState();
  const trpc = useTRPC();
  const listLayout = useListLayoutTypeState();
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();
  const [isInitialPageRendered, setIsInitialPageRendered] = useState(false);

  const { data, isFetchedAfterMount, ...pagination } = useSuspenseInfiniteQuery(
    trpc.map.list.get.infiniteQueryOptions(
      { ...filterParams, sort: sortParams },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    ),
  );

  const [currentPage, setCurrentPage] = useAtom(pageAtom);

  useEffect(() => {
    if (data) {
      setIsSearching(false);
    }
  }, [data]);

  useEffect(() => {
    if (data.pages.length > 0) {
      setIsInitialPageRendered(true);
    }
  }, [data.pages.length]);

  const imagePriority = !isFetchedAfterMount && !isInitialPageRendered;

  return (
    <div className={cn("space-y-3", isSearching && "opacity-20")}>
      {data.pages.map((page, pageIndex) => {
        const isInView = Math.abs(pageIndex - currentPage) <= 1;

        return listLayout === "THREE_COLUMNS" ? (
          <ThreeColumnMapList
            // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
            key={pageIndex}
            items={page.items}
            initialInView={isInView}
            imagePriority={imagePriority && isInView}
            onEnter={setCurrentPage}
            pageIndex={pageIndex}
          />
        ) : (
          <TwoColumnMapList
            // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
            key={pageIndex}
            items={page.items}
            initialInView={isInView}
            imagePriority={imagePriority && isInView}
            onEnter={setCurrentPage}
            pageIndex={pageIndex}
          />
        );
      })}

      <InfiniteScrollSpinner
        rootMarginVariant={listLayout === "THREE_COLUMNS" ? "threeColumnMapList" : "default"}
        {...pagination}
      />
    </div>
  );
};

interface ColumnMapListProps {
  items: MapListItem[];
  initialInView: boolean;
  imagePriority: boolean;
  onEnter: (page: number) => void;
  pageIndex: number;
}

const ThreeColumnMapList = ({ items, initialInView, imagePriority, onEnter, pageIndex }: ColumnMapListProps) => {
  const ref = usePageCounter({ onEnter, pageIndex });

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" ref={ref}>
      {items.map((map) => (
        <CompactMapCard key={map.id} map={map} initialInView={initialInView} imagePriority={imagePriority} />
      ))}
    </section>
  );
};

const TwoColumnMapList = ({ items, initialInView, imagePriority, onEnter, pageIndex }: ColumnMapListProps) => {
  const ref = usePageCounter({ onEnter, pageIndex });

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2" ref={ref}>
      {items.map((map) => (
        <MapCard key={map.id} map={map} initialInView={initialInView} imagePriority={imagePriority} />
      ))}
    </section>
  );
};

const usePageCounter = ({ onEnter, pageIndex }: { onEnter: (page: number) => void; pageIndex: number }) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      onEnter(pageIndex);
    }
  }, [inView, onEnter, pageIndex]);

  return ref;
};
