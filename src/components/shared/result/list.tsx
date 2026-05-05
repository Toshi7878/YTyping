"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, getDefaultStore, useAtom, useAtomValue } from "jotai";
import type { Store } from "jotai/vanilla/store";
import { useEffect, useState } from "react";
import type z from "zod/v4";
import { useTRPC } from "@/app/_layout/trpc/provider";
import { ResultCard } from "@/components/shared/result/card/card";
import { cn } from "@/lib/utils";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import type { ResultListFilterSchema } from "@/validator/result/list";
import { InfiniteScrollSpinner, usePageCounter } from "../infinite-scroll";

const pageAtom = atom<number>(0);
const isSearchingAtom = atom<boolean>(false);
export const useIsSearching = () => useAtomValue(isSearchingAtom);

interface ResultListProps {
  filterParams?: z.input<typeof ResultListFilterSchema>;
  atomStore?: Store;
}

export const ResultList = ({ filterParams = {}, atomStore = getDefaultStore() }: ResultListProps) => {
  const trpc = useTRPC();
  const [isInitialPageRendered, setIsInitialPageRendered] = useState(false);
  const [currentPage, setCurrentPage] = useAtom(pageAtom, { store: atomStore });

  const { data, isFetchedAfterMount, isPlaceholderData, ...pagination } = useInfiniteQuery(
    trpc.result.list.get.infiniteQueryOptions(filterParams, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      gcTime: Infinity,
      placeholderData: (previousData) => previousData,
    }),
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

        return (
          <ResultPageList
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
      <InfiniteScrollSpinner rootMarginY="2000px" {...pagination} />
    </div>
  );
};

interface ResultPageListProps {
  items: ResultWithMapItem[];
  initialInView: boolean;
  imagePriority: boolean;
  onEnter: (page: number) => void;
  pageIndex: number;
}

const ResultPageList = ({ items, initialInView, imagePriority, onEnter, pageIndex }: ResultPageListProps) => {
  const ref = usePageCounter({ onEnter, pageIndex });

  return (
    <section className="grid grid-cols-1 gap-3" ref={ref}>
      {items.map((result) => (
        <ResultCard key={result.id} result={result} initialInView={initialInView} imagePriority={imagePriority} />
      ))}
    </section>
  );
};
