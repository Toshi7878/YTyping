import { Suspense } from "react";
import { loadMapListSearchParams } from "@/lib/search-params/map-list";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { MapControlArea } from "./_components/map-control-area";
import { MapList } from "./_components/map-list";
import { JotaiProvider } from "./_components/provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const mapListQueryParams = loadMapListSearchParams(await searchParams);

  prefetch(trpc.mapList.get.infiniteQueryOptions(mapListQueryParams));
  prefetch(trpc.bookmarkList.getForSession.queryOptions());

  const { minRate, maxRate } = mapListQueryParams;
  return (
    <HydrateClient>
      <JotaiProvider minRate={minRate} maxRate={maxRate}>
        <div className="mx-auto max-w-7xl lg:px-8">
          <Suspense>
            <MapControlArea />
            <MapList />
          </Suspense>
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
