import { loadMapListSearchParams } from "@/app/(home)/_feature/controls/search-params";
import { getSession } from "@/lib/auth";
import { getCaller, HydrateClient, prefetch, trpc } from "@/trpc/server";
import { MapListControls } from "./_feature/controls/controls";
import { MapList } from "./_feature/map-list";
import { JotaiProvider } from "./_feature/provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const session = await getSession();
  const { sort, ...mapListFilterParams } = loadMapListSearchParams(await searchParams);
  const caller = getCaller();
  const [mapList, bookmarkLists] = await Promise.all([
    caller.map.list.get({ ...mapListFilterParams, sortType: sort.value, isSortDesc: sort.desc }),
    session ? caller.map.bookmark.lists.getForSession() : Promise.resolve([]),
  ]);
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
  prefetch(trpc.map.bookmark.lists.getForSession.queryOptions(undefined, { initialData: bookmarkLists }));

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
