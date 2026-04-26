import { loadMapListSearchParams } from "@/app/(home)/_feature/search/search-params";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { MapList } from "./_feature/map-list";
import { JotaiProvider } from "./_feature/provider";
import { MapControlArea } from "./_feature/search/map-control-area";

export default async function Home({ searchParams }: PageProps<"/">) {
  const mapListQueryParams = loadMapListSearchParams(await searchParams);

  prefetch(trpc.map.list.get.infiniteQueryOptions(mapListQueryParams));
  prefetch(trpc.map.bookmark.lists.getForSession.queryOptions());

  return (
    <HydrateClient>
      <JotaiProvider>
        <div className="mx-auto max-w-7xl lg:px-8">
          <MapControlArea />
          <MapList />
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
