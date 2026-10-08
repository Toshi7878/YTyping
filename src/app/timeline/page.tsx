import { loadResultListSearchParams } from "@/app/timeline/_feature/search-params";
import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { SearchContent } from "./_feature/controls/controls";
import { TimelineResultList } from "./_feature/result-list";

export default async function Home({ searchParams }: PageProps<"/timeline">) {
  const params = await loadResultListSearchParams(searchParams);
  await prefetchAsync(
    orpc.result.list.get.infiniteOptions({
      input: (pageParam) => ({ ...params, cursor: pageParam }),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }),
  );

  return (
    <HydrateClient>
      <div className="mx-auto w-full space-y-8 lg:w-5xl">
        <SearchContent />
        <TimelineResultList />
      </div>
    </HydrateClient>
  );
}
