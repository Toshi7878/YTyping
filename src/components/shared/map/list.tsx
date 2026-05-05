"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, getDefaultStore, useAtom, useAtomValue } from "jotai";
import type { Store } from "jotai/vanilla/store";
import { useEffect, useState } from "react";
import type z from "zod/v4";
import { useTRPC } from "@/app/_layout/trpc/provider";
import { MapCard } from "@/components/shared/map/card/card";
import { CompactMapCard } from "@/components/shared/map/card/compact";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import type { MapSearchFilterSchema, mapSortSchema } from "@/validator/map/list";
import { InfiniteScrollSpinner, usePageCounter } from "../infinite-scroll";

const pageAtom = atom<number>(0);
const isSearchingAtom = atom<boolean>(false);
export const useIsSearching = () => useAtomValue(isSearchingAtom);

interface MapListProps {
  filterParams?: z.input<typeof MapSearchFilterSchema>;
  sortParams?: z.input<typeof mapSortSchema>;
  layoutType?: "THREE_COLUMNS" | "TWO_COLUMNS";
  atomStore?: Store;
}

export const MapList = ({
  filterParams,
  sortParams = {},
  layoutType = "TWO_COLUMNS",
  atomStore = getDefaultStore(),
}: MapListProps) => {
  const trpc = useTRPC();
  const [isInitialPageRendered, setIsInitialPageRendered] = useState(false);
  const [currentPage, setCurrentPage] = useAtom(pageAtom, { store: atomStore });

  const { data, isFetchedAfterMount, isPending, isPlaceholderData, ...pagination } = useInfiniteQuery(
    trpc.map.list.get.infiniteQueryOptions(
      { ...filterParams, sort: sortParams },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: Infinity,
        gcTime: Infinity,
        placeholderData: (previousData) => previousData,
      },
    ),
  );

  useEffect(() => {
    atomStore.set(isSearchingAtom, isPlaceholderData);
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

      <InfiniteScrollSpinner rootMarginY={layoutType === "THREE_COLUMNS" ? "300px" : "1500px"} {...pagination} />
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
