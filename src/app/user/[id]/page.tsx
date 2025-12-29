import { H1 } from "@/components/ui/typography";
import { prefetch, serverApi, trpc } from "@/trpc/server";
import { UserTabs } from "./_components/tabs";
import { UserProfileCard } from "./_components/user-profile-card";
import { loadUserPageSearchParams } from "./_lib/search-params";

export default async function Page({ params, searchParams }: PageProps<"/user/[id]">) {
  const { id } = await params;
  const { tab } = await loadUserPageSearchParams(searchParams);
  const userProfile = await serverApi.userProfile.getUserProfile({ userId: Number(id) });

  prefetch(trpc.mapList.getCount.queryOptions({ creatorId: Number(id) }));
  prefetch(trpc.mapList.getCount.queryOptions({ likerId: Number(id) }));
  prefetch(trpc.resultList.getWithMapCount.queryOptions({ playerId: Number(id) }));
  prefetch(trpc.bookmarkList.getCount.queryOptions({ userId: Number(id) }));

  if (tab === "stats") {
    prefetch(trpc.userStats.getUserStats.queryOptions({ userId: Number(id) }));
  } else if (tab === "bookmarks") {
    prefetch(trpc.bookmarkList.getByUserId.queryOptions({ userId: Number(id) }));
    prefetch(
      trpc.mapList.get.infiniteQueryOptions({ bookmarkListId: Number(id), sort: { value: "bookmark", desc: true } }),
    );
  } else if (tab === "maps") {
    prefetch(trpc.mapList.get.infiniteQueryOptions({ creatorId: Number(id) }));
  } else if (tab === "results") {
    prefetch(trpc.resultList.getWithMap.infiniteQueryOptions({ playerId: Number(id) }));
    prefetch(trpc.result.getUserResultStats.queryOptions({ userId: Number(id) }));
  } else if (tab === "liked") {
    prefetch(trpc.mapList.get.infiniteQueryOptions({ likerId: Number(id) }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-10">
      <H1>プレイヤー情報</H1>
      <UserProfileCard userProfile={userProfile} />
      <UserTabs id={id} />
    </div>
  );
}
