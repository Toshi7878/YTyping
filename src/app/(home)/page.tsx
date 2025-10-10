import { loadMapListSearchParams } from "@/lib/queries/schema/map-list";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { JotaiProvider } from "./_components/jotai-provider";
import { MapControlArea } from "./_components/map-control-area";
import { MapList } from "./_components/map-list";

export default async function Home({ searchParams }: PageProps<"/">) {
  const mapListQueryParams = loadMapListSearchParams(await searchParams);

  prefetch(trpc.mapList.getList.infiniteQueryOptions(mapListQueryParams));

  const { minRate, maxRate } = mapListQueryParams;
  return (
    <HydrateClient>
      <JotaiProvider minRate={minRate} maxRate={maxRate}>
        <div className="mx-auto max-w-screen-xl lg:px-8">
          <MapControlArea />
          <MapList />
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
