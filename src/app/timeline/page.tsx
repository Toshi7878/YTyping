import { loadResultListSearchParams } from "@/lib/search-params/result-list";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { JotaiProvider } from "./_components/provider";
import { UsersResultList } from "./_components/result-list";
import { SearchContent } from "./_components/search-content";

export default async function Home({ searchParams }: PageProps<"/timeline">) {
  const params = loadResultListSearchParams(await searchParams);
  prefetch(trpc.result.list.get.infiniteQueryOptions(params));

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
