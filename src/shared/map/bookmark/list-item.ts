import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import type { MapListItem } from "@/server/api/routers/map";
import { updateInfiniteQueryCache, updateQueryCache } from "../../../lib/react-query";

type BookmarkListsByUserIdItem = RouterOutputs["map"]["bookmark"]["lists"]["getByUserId"][number];
type MapInfo = RouterOutputs["map"]["getById"];

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

function getIncludeMapIdFromQueryKey(key: unknown): number | undefined {
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

async function runOptimisticUpdate(args: { queryClient: ReturnType<typeof useQueryClient>; input: ToggleInput }) {
  const { queryClient, input } = args;

  const mapListFilter = { queryKey: orpc.map.list.key() };
  const mapInfoFilter = { queryKey: orpc.map.getById.queryKey({ input: { mapId: input.mapId } }) };
  const resultListFilter = { queryKey: orpc.result.list.key() };
  const notificationsFilter = { queryKey: orpc.notification.getInfinite.key({ type: "infinite" }) };
  const bookmarkListsByUserIdFilter = { queryKey: orpc.map.bookmark.lists.getByUserId.key({ type: "query" }) };

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
    const includeMapId = getIncludeMapIdFromQueryKey(key);
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
  const queryClient = useQueryClient();

  return useMutation(
    orpc.map.bookmark.listItem.add.mutationOptions({
      onMutate: async (input) => runOptimisticUpdate({ queryClient, input: { ...input, action: "add" } }),
      onError: (_err, _vars, ctx) => {
        if (!ctx?.previous) return;
        for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
      },
      onSuccess: (_data, input, ctx) => {
        if (!ctx) return;
        queryClient.invalidateQueries(ctx.bookmarkListsByUserIdFilter);
        queryClient.invalidateQueries({
          queryKey: orpc.map.bookmark.lists.getByUserId.queryKey({ input: { includeMapId: input.mapId } as never }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.map.bookmark.lists.getForSession.key({ type: "query" }) });
      },
    }),
  );
}

export function useRemoveBookmarkListItemMutation() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.map.bookmark.listItem.remove.mutationOptions({
      onMutate: async (input) => runOptimisticUpdate({ queryClient, input: { ...input, action: "remove" } }),
      onError: (_err, _vars, ctx) => {
        if (!ctx?.previous) return;
        for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
      },
      onSuccess: (_data, input, ctx) => {
        if (!ctx) return;
        queryClient.invalidateQueries(ctx.bookmarkListsByUserIdFilter);
        queryClient.invalidateQueries({
          queryKey: orpc.map.bookmark.lists.getByUserId.queryKey({ input: { includeMapId: input.mapId } as never }),
        });
      },
    }),
  );
}
