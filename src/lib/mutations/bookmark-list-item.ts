import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { updateInfiniteQueryCache, updateQueryCache } from "../update-query-cache";

type BookmarkListsByUserIdItem = RouterOutputs["map"]["bookmark"]["list"]["getByUserId"][number];
type MapInfo = RouterOutputs["map"]["detail"]["getInfo"];

const createMapBookmarkUpdater = (mapId: number, hasBookmarked: boolean) => {
  const updateBookmark = <T extends { id: number; bookmark: { hasBookmarked: boolean } }>(map: T): T => {
    if (map.id !== mapId) return map;
    return { ...map, bookmark: { ...map.bookmark, hasBookmarked } };
  };

  return {
    forMapListItem: (map: MapListItem) => updateBookmark(map),
    forMapInfo: (map: MapInfo) => updateBookmark(map),
    forItemWithMap: <T>(item: T): T => {
      const i = item as T & { map: MapListItem };
      if (i.map?.id !== mapId) return item;
      return { ...i, map: updateBookmark(i.map) };
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

function computeNextHasBookmarkedFromBookmarkLists(args: {
  data: BookmarkListsByUserIdItem[];
  listId: number;
  action: ToggleInput["action"];
}) {
  const { data, listId, action } = args;
  const nextHasMapForTargetList = action === "add";
  const anyOtherHasMap = data.some((l) => l.id !== listId && l.hasMap);
  return nextHasMapForTargetList || anyOtherHasMap;
}

async function runOptimisticUpdate(args: {
  trpc: ReturnType<typeof useTRPC>;
  queryClient: ReturnType<typeof useQueryClient>;
  input: ToggleInput;
}) {
  const { trpc, queryClient, input } = args;

  const mapListFilter = trpc.map.list.pathFilter();
  const mapInfoFilter = trpc.map.detail.getInfo.queryFilter({ mapId: input.mapId });
  const resultListFilter = trpc.resultList.pathFilter();
  const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
  const bookmarkListsByUserIdFilter = trpc.map.bookmark.list.getByUserId.queryFilter();

  await Promise.all([
    queryClient.cancelQueries(mapInfoFilter),
    queryClient.cancelQueries(mapListFilter),
    queryClient.cancelQueries(resultListFilter),
    queryClient.cancelQueries(notificationsFilter),
    queryClient.cancelQueries(bookmarkListsByUserIdFilter),
  ]);

  const previous = [
    ...queryClient.getQueriesData(mapInfoFilter),
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
    nextHasBookmarked = computeNextHasBookmarkedFromBookmarkLists({
      data,
      listId: input.listId,
      action: input.action,
    });

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

    updateInfiniteQueryCache(queryClient, mapListFilter, updater.forMapListItem);
    updateQueryCache(queryClient, mapListFilter, updater.forMapListItem);
    updateQueryCache(queryClient, mapInfoFilter, updater.forMapInfo);

    updateInfiniteQueryCache(queryClient, resultListFilter, updater.forItemWithMap);
    updateInfiniteQueryCache(queryClient, notificationsFilter, updater.forItemWithMap);
  }

  return { previous, mapListFilter, resultListFilter, notificationsFilter, bookmarkListsByUserIdFilter };
}

export function useAddBookmarkListItemMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.map.bookmark.detail.add.mutationOptions({
      onMutate: async (input) => runOptimisticUpdate({ trpc, queryClient, input: { ...input, action: "add" } }),
      onError: (_err, _vars, ctx) => {
        if (!ctx?.previous) return;
        for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
      },
      onSuccess: (_data, input, ctx) => {
        if (!ctx) return;
        queryClient.invalidateQueries(ctx.bookmarkListsByUserIdFilter);
        queryClient.invalidateQueries(
          trpc.map.bookmark.list.getByUserId.queryFilter({ includeMapId: input.mapId } as never),
        );
      },
    }),
  );
}

export function useRemoveBookmarkListItemMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.map.bookmark.detail.remove.mutationOptions({
      onMutate: async (input) => runOptimisticUpdate({ trpc, queryClient, input: { ...input, action: "remove" } }),
      onError: (_err, _vars, ctx) => {
        if (!ctx?.previous) return;
        for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
      },
      onSuccess: (_data, input, ctx) => {
        if (!ctx) return;
        queryClient.invalidateQueries(ctx.bookmarkListsByUserIdFilter);
        queryClient.invalidateQueries(
          trpc.map.bookmark.list.getByUserId.queryFilter({ includeMapId: input.mapId } as never),
        );
      },
    }),
  );
}
