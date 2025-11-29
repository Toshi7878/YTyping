import type { InfiniteData, QueryClient, QueryFilters } from "@tanstack/react-query";

export function updateInfiniteQuery<T>(queryClient: QueryClient, filter: QueryFilters, updater: (item: T) => T) {
  queryClient.setQueriesData<InfiniteData<{ items: T[] }>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map(updater),
      })),
    };
  });
}

export function updateListQuery<T>(queryClient: QueryClient, filter: QueryFilters, updater: (item: T) => T) {
  queryClient.setQueriesData<T[]>(filter, (old) => {
    if (!old) return old;
    return old.map(updater);
  });
}
