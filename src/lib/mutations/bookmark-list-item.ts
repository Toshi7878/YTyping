import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { updateInfiniteQueryCache, updateQueryCache } from "../update-query-cache";

type BookmarkListsByUserIdItem = RouterOutputs["bookmarkList"]["getByUserId"][number];

const createMapBookmarkUpdater = (mapId: number, hasBookmarked: boolean) => {
  const updateMap = (map: MapListItem): MapListItem => {
    if (map.id !== mapId) return map;
    return { ...map, bookmark: { ...map.bookmark, hasBookmarked } };
  };

  return {
    forMap: updateMap,
    forItemWithMap: <T>(item: T): T => {
      const i = item as T & { map: MapListItem };
      if (i.map?.id !== mapId) return item;
      return { ...i, map: updateMap(i.map) };
    },
  };
};

type ToggleInput = { listId: number; mapId: number; action: "add" | "remove" };

function getIncludeMapIdFromTrpcQueryKey(key: unknown): number | undefined {
  const k = key as unknown[] | undefined;
  const meta = (k?.[1] ?? null) as { input?: unknown } | null;
  const input = meta?.input as { includeMapId?: unknown } | null;
  return typeof input?.includeMapId === "number" ? input.includeMapId : undefined;
}

async function runOptimisticUpdate(args: {
  trpc: ReturnType<typeof useTRPC>;
  queryClient: ReturnType<typeof useQueryClient>;
  input: ToggleInput;
}) {
  const { trpc, queryClient, input } = args;

  const mapListFilter = trpc.mapList.pathFilter();
  const resultListFilter = trpc.resultList.pathFilter();
  const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
  const bookmarkListsByUserIdFilter = trpc.bookmarkList.getByUserId.queryFilter();

  await Promise.all([
    queryClient.cancelQueries(mapListFilter),
    queryClient.cancelQueries(resultListFilter),
    queryClient.cancelQueries(notificationsFilter),
    queryClient.cancelQueries(bookmarkListsByUserIdFilter),
  ]);

  const previous = [
    ...queryClient.getQueriesData(mapListFilter),
    ...queryClient.getQueriesData(resultListFilter),
    ...queryClient.getQueriesData(notificationsFilter),
    ...queryClient.getQueriesData(bookmarkListsByUserIdFilter),
  ];

  // --- Optimistic Updates ---
  // bookmarkList.getByUserId(includeMapId=mapId) のキャッシュから
  // 「このmapが"どれか1つでも"ブックマークされているか」を合成して更新する
  const listQueries = queryClient.getQueriesData<BookmarkListsByUserIdItem[]>(bookmarkListsByUserIdFilter);
  let nextHasBookmarked: boolean | undefined;

  for (const [key, data] of listQueries) {
    const includeMapId = getIncludeMapIdFromTrpcQueryKey(key);
    if (includeMapId !== input.mapId) continue;
    if (!data) continue;

    const target = data.find((l) => l.id === input.listId);
    if (!target) continue;

    const nextHasMapForTargetList = input.action === "add";
    const anyOtherHasMap = data.some((l) => l.id !== input.listId && l.hasMap);
    nextHasBookmarked = nextHasMapForTargetList || anyOtherHasMap;

    // まずリスト側を更新（hasMap / count）
    queryClient.setQueryData<BookmarkListsByUserIdItem[]>(key, (old) => {
      if (!old) return old;
      return old.map((l) => {
        if (l.id !== input.listId) return l;
        const nextCount = nextHasMapForTargetList ? l.count + 1 : Math.max(0, l.count - 1);
        return { ...l, hasMap: nextHasMapForTargetList, count: nextCount };
      });
    });
  }

  // map側は「合成結果」が取れた時だけ更新
  if (nextHasBookmarked !== undefined) {
    const updater = createMapBookmarkUpdater(input.mapId, nextHasBookmarked);

    updateInfiniteQueryCache(queryClient, mapListFilter, updater.forMap);
    updateQueryCache(queryClient, mapListFilter, updater.forMap);

    updateInfiniteQueryCache(queryClient, resultListFilter, updater.forItemWithMap);
    updateInfiniteQueryCache(queryClient, notificationsFilter, updater.forItemWithMap);
  }

  return { previous, mapListFilter, resultListFilter, notificationsFilter, bookmarkListsByUserIdFilter };
}

export function useAddBookmarkListItemMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.bookmarkListItem.addMap.mutationOptions({
      onMutate: async (input) => runOptimisticUpdate({ trpc, queryClient, input: { ...input, action: "add" } }),
      onError: (_err, _vars, ctx) => {
        if (!ctx?.previous) return;
        for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
      },
      onSuccess: (_data, input, ctx) => {
        if (!ctx) return;
        queryClient.invalidateQueries(ctx.bookmarkListsByUserIdFilter);
        queryClient.invalidateQueries(
          trpc.bookmarkList.getByUserId.queryFilter({ includeMapId: input.mapId } as never),
        );
      },
    }),
  );
}

export function useRemoveBookmarkListItemMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.bookmarkListItem.removeMap.mutationOptions({
      onMutate: async (input) => runOptimisticUpdate({ trpc, queryClient, input: { ...input, action: "remove" } }),
      onError: (_err, _vars, ctx) => {
        if (!ctx?.previous) return;
        for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
      },
      onSuccess: (_data, input, ctx) => {
        if (!ctx) return;
        queryClient.invalidateQueries(ctx.bookmarkListsByUserIdFilter);
        queryClient.invalidateQueries(
          trpc.bookmarkList.getByUserId.queryFilter({ includeMapId: input.mapId } as never),
        );
      },
    }),
  );
}
