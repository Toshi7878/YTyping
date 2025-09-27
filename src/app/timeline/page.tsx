import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { parseResultListSearchParams } from "@/utils/queries/search-params/result-list";
import { SearchContent } from "./_components/search-content";
import { UsersResultList } from "./_components/users-result-list";
import { TimelineProvider } from "./client-provider";

export default async function Home({ searchParams }: PageProps<"/timeline">) {
  const raw = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      for (const v of value) usp.append(key, v);
    } else if (typeof value === "string") {
      usp.append(key, value);
    }
  }

  const params = parseResultListSearchParams(usp);
  prefetch(trpc.result.usersResultList.infiniteQueryOptions(params));

  return (
    <HydrateClient>
      <TimelineProvider>
        <div className="mx-auto w-full space-y-8 lg:w-5xl">
          <SearchContent />
          <UsersResultList />
        </div>
      </TimelineProvider>
    </HydrateClient>
  );
}
