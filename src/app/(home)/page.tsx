import { loadMapListSearchParams } from "@/app/(home)/_feature/controls/search-params";
import { getSession } from "@/auth/server";
import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { MapListControls } from "./_feature/controls/controls";
import { HomeMapList } from "./_feature/map-list";
import { JotaiProvider } from "./_feature/provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { sort, ...mapListFilterParams } = await loadMapListSearchParams(searchParams);
  const session = await getSession();

  await Promise.all([
    prefetchAsync(
      orpc.map.list.get.infiniteOptions({
        input: (pageParam) => ({ ...mapListFilterParams, sort, cursor: pageParam }),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: ({ nextCursor }) => nextCursor,
      }),
    ),
    session ? prefetchAsync(orpc.map.bookmark.lists.getForSession.queryOptions()) : Promise.resolve(),
    session ? prefetchAsync(orpc.importantNotice.getActive.queryOptions()) : Promise.resolve(),
  ]);

  return (
    <HydrateClient>
      <JotaiProvider>
        <div className="mx-auto max-w-7xl space-y-3 lg:px-24">
          <MapListControls />
          <HomeMapList />
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
