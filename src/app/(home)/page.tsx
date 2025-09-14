import MapControlArea from "./_components/MapControlArea";
import MapList from "./_components/MapList";
import HomeProvider from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  // const raw = await searchParams;
  // const usp = new URLSearchParams();
  // Object.entries(raw).forEach(([k, v]) => {
  //   if (Array.isArray(v)) v.forEach((vv) => usp.append(k, vv));
  //   else if (typeof v === "string") usp.append(k, v);
  // });

  // const params = parseMapListSearchParams(usp);

  // const list = await serverApi.mapList.getList(params);

  return (
    <HomeProvider>
      <div className="mx-auto max-w-screen-xl lg:px-8">
        <MapControlArea />

        <MapList />
      </div>
    </HomeProvider>
  );
}
