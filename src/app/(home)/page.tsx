import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { loadSearchParams } from "@/utils/queries/search-params/map-list";
import { MapControlArea } from "./_components/map-control-area";
import { MapList } from "./_components/map-list";
import { JotaiProvider } from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const mapListQueryParams = loadSearchParams(await searchParams);

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
