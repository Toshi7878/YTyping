import type { InfiniteData, QueryClient, QueryFilters } from "@tanstack/react-query";

export function updateInfiniteQueryCache<T>(queryClient: QueryClient, filter: QueryFilters, updater: (item: T) => T) {
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

export function updateQueryCache<T>(queryClient: QueryClient, filter: QueryFilters, updater: (item: T) => T) {
  queryClient.setQueriesData<T | T[]>(filter, (old) => {
    if (!old) return old;

    if (Array.isArray(old)) {
      return old.map(updater);
    }

    return updater(old as T);
  });
}
