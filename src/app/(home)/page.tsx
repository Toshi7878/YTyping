import { serverApi } from "@/trpc/server";
import { getMapListSearchParams } from "@/utils/queries/mapList.queries";
import MapControlArea from "./_components/MapControlArea";
import MapList from "./_components/MapList";
import HomeProvider from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const raw = await searchParams;
  const usp = new URLSearchParams();
  Object.entries(raw).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((vv) => usp.append(k, vv));
    else if (typeof v === "string") usp.append(k, v);
  });
  const params = getMapListSearchParams(usp);

  const list = await serverApi.mapList.getList({
    filter: params.filter,
    minRate: params.minRate ? Number(params.minRate) : undefined,
    maxRate: params.maxRate ? Number(params.maxRate) : undefined,
    played: params.played,
    keyword: params.keyword ?? "",
    sort: params.sort,
  });

  return (
    <HomeProvider>
      <div className="mx-auto max-w-screen-xl lg:px-8">
        <MapControlArea />

        <MapList list={list} />
      </div>
    </HomeProvider>
  );
}
