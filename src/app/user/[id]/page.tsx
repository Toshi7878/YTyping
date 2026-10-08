import { notFound } from "next/navigation";
import { caller, HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { H1 } from "@/ui/typography";
import { loadUserPageSearchParams } from "./_features/search-params";
import { UserTabs } from "./_features/tabs";
import { UserProfileCard } from "./_features/user-profile-card";

export default async function Page({ params, searchParams }: PageProps<"/user/[id]">) {
  const { id } = await params;
  const { tab, bookmarkListId } = await loadUserPageSearchParams(searchParams);

  const numericId = Number(id);

  const tabQueryOptions = (() => {
    switch (tab) {
      case "stats":
        return [
          orpc.user.stats.get.queryOptions({ input: { userId: numericId } }),
          orpc.user.stats.getActivityOldestYear.queryOptions({ input: { userId: numericId } }),
          orpc.result.pp.userTopList.infiniteOptions({
            input: (pageParam) => ({ playerId: numericId, cursor: pageParam }),
            initialPageParam: undefined as number | undefined,
            getNextPageParam: ({ nextCursor }) => nextCursor,
          }),
        ];
      case "maps":
        return [
          orpc.map.list.get.infiniteOptions({
            input: (pageParam) => ({ creatorId: numericId, sort: {}, cursor: pageParam }),
            initialPageParam: undefined as number | undefined,
            getNextPageParam: ({ nextCursor }) => nextCursor,
          }),
        ];
      case "liked":
        return [
          orpc.map.list.get.infiniteOptions({
            input: (pageParam) => ({ likerId: numericId, sort: { type: "like", isDesc: true }, cursor: pageParam }),
            initialPageParam: undefined as number | undefined,
            getNextPageParam: ({ nextCursor }) => nextCursor,
          }),
        ];
      case "bookmarks": {
        if (bookmarkListId) {
          return [
            orpc.map.list.get.infiniteOptions({
              input: (pageParam) => ({
                bookmarkListId: Number(bookmarkListId),
                sort: { type: "bookmark", isDesc: true },
                cursor: pageParam,
              }),
              initialPageParam: undefined as number | undefined,
              getNextPageParam: ({ nextCursor }) => nextCursor,
            }),
          ];
        }
        return [orpc.map.bookmark.lists.getByUserId.queryOptions({ input: { userId: numericId } })];
      }
      default:
        return [];
    }
  })();

  const userProfile = await caller.user.profile.get({ userId: numericId });

  if (!userProfile || userProfile.banned) {
    notFound();
  }

  await Promise.all([
    prefetchAsync(orpc.map.list.getCount.queryOptions({ input: { creatorId: numericId } })),
    prefetchAsync(orpc.map.list.getCount.queryOptions({ input: { likerId: numericId } })),
    prefetchAsync(orpc.ranking.pp.getRanksByUserId.queryOptions({ input: numericId })),
    prefetchAsync(orpc.result.list.getCount.queryOptions({ input: { playerId: numericId } })),
    prefetchAsync(orpc.map.bookmark.lists.getCount.queryOptions({ input: { userId: numericId } })),
    ...tabQueryOptions.map(prefetchAsync),
  ]);

  return (
    <HydrateClient>
      <div className="mx-auto max-w-5xl space-y-4 pb-10">
        <H1>プレイヤー情報</H1>
        <UserProfileCard userProfile={userProfile} />
        <UserTabs id={id} />
      </div>
    </HydrateClient>
  );
}
