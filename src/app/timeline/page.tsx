import { serverApi } from "@/trpc/server";
import { parseResultListSearchParams } from "@/utils/queries/search-params/resultList";
import SearchContent from "./_components/SearchContent";
import UsersResultList from "./_components/UsersResultList";
import TimelineProvider from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/timeline">) {
  const raw = await searchParams;
  const usp = new URLSearchParams();
  Object.entries(raw).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((vv) => usp.append(k, vv));
    else if (typeof v === "string") usp.append(k, v);
  });

  const params = parseResultListSearchParams(usp);
  const list = await serverApi.result.usersResultList(params);

  return (
    <TimelineProvider>
      <div className="mx-auto w-full space-y-8 lg:w-5xl">
        <SearchContent />
        <UsersResultList list={list} />
      </div>
    </TimelineProvider>
  );
}
