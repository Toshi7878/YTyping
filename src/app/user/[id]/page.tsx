import { caller, HydrateClient, prefetchAsync, trpc } from "@/trpc/server";
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
          trpc.user.stats.get.queryOptions({ userId: numericId }),
          trpc.user.stats.getActivityOldestYear.queryOptions({ userId: numericId }),
          trpc.result.pp.userTopList.infiniteQueryOptions(
            { playerId: numericId },
            { getNextPageParam: ({ nextCursor }) => nextCursor },
          ),
        ];
      case "maps":
        return [
          trpc.map.list.get.infiniteQueryOptions(
            { creatorId: numericId, sort: {} },
            { getNextPageParam: ({ nextCursor }) => nextCursor },
          ),
        ];
      case "liked":
        return [
          trpc.map.list.get.infiniteQueryOptions(
            { likerId: numericId, sort: { type: "like", isDesc: true } },
            { getNextPageParam: ({ nextCursor }) => nextCursor },
          ),
        ];
      case "bookmarks": {
        if (bookmarkListId) {
          return [
            trpc.map.list.get.infiniteQueryOptions(
              {
                bookmarkListId: Number(bookmarkListId),
                sort: { type: "bookmark", isDesc: true },
              },
              { getNextPageParam: ({ nextCursor }) => nextCursor },
            ),
          ];
        }
        return [trpc.map.bookmark.lists.getByUserId.queryOptions({ userId: numericId })];
      }
      default:
        return [];
    }
  })();

  const [userProfile] = await Promise.all([
    caller.user.profile.get({ userId: Number(id) }),
    prefetchAsync(trpc.map.list.getCount.queryOptions({ creatorId: numericId })),
    prefetchAsync(trpc.map.list.getCount.queryOptions({ likerId: numericId })),
    prefetchAsync(trpc.result.list.getCount.queryOptions({ playerId: numericId })),
    prefetchAsync(trpc.map.bookmark.lists.getCount.queryOptions({ userId: numericId })),
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
