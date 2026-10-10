import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { ResultList } from "@/shared/result/list/list";
import { H1 } from "@/ui/typography";

const filterParams = { invalidOnly: true };

export default async function Page() {
  await prefetchAsync(
    orpc.result.list.get.infiniteOptions({
      input: (pageParam) => ({ ...filterParams, cursor: pageParam }),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }),
  );

  return (
    <HydrateClient>
      <div className="mx-auto w-full space-y-6 px-4 py-8 lg:w-5xl">
        <H1>BANした記録</H1>
        <ResultList filterParams={filterParams} />
      </div>
    </HydrateClient>
  );
}
