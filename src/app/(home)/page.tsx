import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { parseMapListSearchParams } from "@/utils/queries/search-params/map-list";
import MapControlArea from "./_components/map-control-area";
import MapList from "./_components/map-list";
import HomeProvider from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const raw = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      for (const v of value) usp.append(key, v);
    } else if (typeof value === "string") {
      usp.append(key, value);
    }
  }

  const params = parseMapListSearchParams(usp);

  prefetch(trpc.mapList.getList.infiniteQueryOptions(params));

  return (
    <HydrateClient>
      <HomeProvider>
        <div className="mx-auto max-w-screen-xl lg:px-8">
          <MapControlArea />

          <MapList />
        </div>
      </HomeProvider>
    </HydrateClient>
  );
}
