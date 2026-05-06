import { loadResultListSearchParams } from "@/app/timeline/_feature/search-params";
import { HydrateClient, prefetchAsync, trpc } from "@/trpc/server";
import { SearchContent } from "./_feature/controls/controls";
import { TimelineResultList } from "./_feature/result-list";

export default async function Home({ searchParams }: PageProps<"/timeline">) {
  const params = loadResultListSearchParams(await searchParams);
  await prefetchAsync(
    trpc.result.list.get.infiniteQueryOptions(params, { getNextPageParam: ({ nextCursor }) => nextCursor }),
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
