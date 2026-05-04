import { loadMapListSearchParams } from "@/app/(home)/_feature/controls/search-params";
import { getCaller, HydrateClient, prefetch, trpc } from "@/trpc/server";
import { MapListControls } from "./_feature/controls/controls";
import { MapList } from "./_feature/map-list";
import { JotaiProvider } from "./_feature/provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { sort, ...mapListFilterParams } = loadMapListSearchParams(await searchParams);
  const caller = getCaller();
  const mapList = await caller.map.list.get({
    ...mapListFilterParams,
    sortType: sort.value,
    isSortDesc: sort.desc,
  });
  prefetch(
    trpc.map.list.get.infiniteQueryOptions(
      {
        ...mapListFilterParams,
        sortType: sort.value,
        isSortDesc: sort.desc,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        initialData: { pages: [mapList], pageParams: [null] },
      },
    ),
  );
  prefetch(trpc.map.bookmark.lists.getForSession.queryOptions());

  return (
    <HydrateClient>
      <JotaiProvider>
        <div className="mx-auto max-w-7xl space-y-3 lg:px-8">
          <MapListControls />
          <MapList />
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
