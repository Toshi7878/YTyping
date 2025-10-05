import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { loadSearchParams } from "@/utils/queries/search-params/map-list";
import { MapControlArea } from "./_components/map-control-area";
import { MapList } from "./_components/map-list";
import { HomeClientProvider } from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const mapListQueryParams = loadSearchParams(await searchParams);

  prefetch(trpc.mapList.getList.infiniteQueryOptions(mapListQueryParams));
  return (
    <HydrateClient>
      <HomeClientProvider>
        <div className="mx-auto max-w-screen-xl lg:px-8">
          <MapControlArea />
          <MapList />
        </div>
      </HomeClientProvider>
    </HydrateClient>
  );
}
