import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { parseMapListSearchParams } from "@/utils/queries/search-params/map-list";
import { MapControlArea } from "./_components/map-control-area";
import { MapList } from "./_components/map-list";
import { HomeClientProvider } from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const searchParamEntries = await searchParams;

  console.log(searchParamEntries);
  const searchParamsObject = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParamEntries)) {
    if (Array.isArray(value)) {
      for (const v of value) searchParamsObject.append(key, v);
    } else if (typeof value === "string") {
      searchParamsObject.append(key, value);
    }
  }

  console.log(searchParamsObject);

  const mapListQueryParams = parseMapListSearchParams(searchParamsObject);

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
