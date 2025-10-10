import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { loadResultListSearchParams } from "@/utils/queries/schema/result-list";
import { SearchContent } from "./_components/search-content";
import { UsersResultList } from "./_components/users-result-list";
import { JotaiProvider } from "./jotai-provider";

export default async function Home({ searchParams }: PageProps<"/timeline">) {
  const params = loadResultListSearchParams(await searchParams);
  prefetch(trpc.result.getAllWithMap.infiniteQueryOptions(params));

  return (
    <HydrateClient>
      <JotaiProvider params={params}>
        <div className="mx-auto w-full space-y-8 lg:w-5xl">
          <SearchContent />
          <UsersResultList />
        </div>
      </JotaiProvider>
    </HydrateClient>
  );
}
