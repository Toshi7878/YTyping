import { loadMapListSearchParams } from "@/app/(home)/_feature/controls/search-params";
import { getSession } from "@/auth/server";
import { HydrateClient, prefetchAsync, trpc } from "@/trpc/server";
import { MapListControls } from "./_feature/controls/controls";
import { HomeMapList } from "./_feature/map-list";
import { JotaiProvider } from "./_feature/provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { sort, ...mapListFilterParams } = loadMapListSearchParams(await searchParams);
  const session = await getSession();

  await Promise.all([
    prefetchAsync(
      trpc.map.list.get.infiniteQueryOptions(
        { ...mapListFilterParams, sort },
        { getNextPageParam: ({ nextCursor }) => nextCursor },
      ),
    ),
    session ? prefetchAsync(trpc.map.bookmark.lists.getForSession.queryOptions()) : Promise.resolve(),
  ]);

  return (
    <HydrateClient>
      <JotaiProvider>
        <div className="mx-auto max-w-7xl space-y-3 lg:px-8">
          <MapListControls />
          <HomeMapList />
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
