import { loadMapListSearchParams } from "@/lib/search-params/map-list";
import { HydrateClient, prefetch, serverApi, trpc } from "@/trpc/server";
import { MapControlArea } from "./_components/map-control-area";
import { MapList } from "./_components/map-list";
import { JotaiProvider } from "./_components/provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const mapListQueryParams = loadMapListSearchParams(await searchParams);

  prefetch(trpc.map.list.get.infiniteQueryOptions(mapListQueryParams));
  prefetch(trpc.map.bookmark.list.getForSession.queryOptions());
  const userOptions = await serverApi.user.option.getForSession();

  return (
    <HydrateClient>
      <JotaiProvider userOptions={userOptions}>
        <div className="mx-auto max-w-7xl lg:px-8">
          <MapControlArea />
          <MapList />
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
