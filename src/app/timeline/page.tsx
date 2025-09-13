import { serverApi } from "@/trpc/server";
import { getSearchParams } from "@/utils/queries/resultList.queries";
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

  const params = getSearchParams(usp);
  const list = await serverApi.result.usersResultList({
    mode: params.mode ?? undefined,
    minKpm: params.minKpm ? Number(params.minKpm) : undefined,
    maxKpm: params.maxKpm ? Number(params.maxKpm) : undefined,
    minClearRate: params.minClearRate ? Number(params.minClearRate) : undefined,
    maxClearRate: params.maxClearRate ? Number(params.maxClearRate) : undefined,
    minPlaySpeed: params.minPlaySpeed ? Number(params.minPlaySpeed) : undefined,
    maxPlaySpeed: params.maxPlaySpeed ? Number(params.maxPlaySpeed) : undefined,
    username: params.username ?? undefined,
    mapKeyword: params.mapkeyword ?? undefined,
  });

  return (
    <TimelineProvider>
      <div className="mx-auto w-full space-y-8 lg:w-5xl">
        <SearchContent />
        <UsersResultList list={list} />
      </div>
    </TimelineProvider>
  );
}
