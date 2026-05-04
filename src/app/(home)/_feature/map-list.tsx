"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { MapCard } from "@/components/shared/map-card/card";
import { CompactMapCard } from "@/components/shared/map-card/compact-card";
import { useMapListLayoutTypeState } from "@/lib/atoms/global-atoms";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import { useTRPC } from "@/trpc/provider";
import { useMapListFilterQueryStates, useMapListSortQueryState } from "./controls/search-params";
import { store } from "./provider";

const pageAtom = atom<number>(0);
const isSearchingAtom = atom<boolean>(false);
export const useIsSearching = () => useAtomValue(isSearchingAtom);

export const MapList = () => {
  const trpc = useTRPC();
  const layoutType = useMapListLayoutTypeState();
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();
  const [isInitialPageRendered, setIsInitialPageRendered] = useState(false);
  const [currentPage, setCurrentPage] = useAtom(pageAtom);

  const { data, isFetchedAfterMount, isPending, isPlaceholderData, ...pagination } = useInfiniteQuery(
    trpc.map.list.get.infiniteQueryOptions(
      { ...filterParams, sortType: sortParams.value, isSortDesc: sortParams.desc },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: Infinity,
        gcTime: Infinity,
        placeholderData: (previousData) => previousData,
      },
    ),
  );

  useEffect(() => {
    store.set(isSearchingAtom, isPlaceholderData);
  }, [isPlaceholderData]);

  useEffect(() => {
    if (data && data.pages.length > 0) {
      setIsInitialPageRendered(true);
    }
  }, [data]);

  const imagePriority = !isFetchedAfterMount && !isInitialPageRendered;

  return (
    <div className={cn("space-y-3", isPlaceholderData && "opacity-20")}>
      {data?.pages.map((page, pageIndex) => {
        const isInView = Math.abs(pageIndex - currentPage) <= 1;

        return layoutType === "THREE_COLUMNS" ? (
          <ThreeColumnMapList
            // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
            key={pageIndex}
            items={page.items}
            initialInView={isInView}
            imagePriority={imagePriority && isInView}
            onEnter={setCurrentPage}
            pageIndex={pageIndex}
          />
        ) : (
          <TwoColumnMapList
            // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
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
        inViewPreset={layoutType === "THREE_COLUMNS" ? "threeColumnMapList" : "default"}
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
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" ref={ref}>
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
