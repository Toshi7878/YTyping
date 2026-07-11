import type { Metadata } from "next";
import Link from "next/link";
import { HydrateClient, prefetchAsync, trpc } from "@/trpc/server";
import { H1 } from "@/ui/typography";
import { PPRanking } from "./_feature/pp-ranking";
import { PPRankingInfoTrigger } from "./_feature/pp-ranking-info-trigger";
import { loadPpRankingSearchParams } from "./_feature/search-params";

export const metadata: Metadata = {
  title: "PP ランキング | YTyping",
  description: "全譜面の合計 Performance Points によるランキング",
};

export default async function Page({ searchParams }: PageProps<"/">) {
  const { page, mode } = await loadPpRankingSearchParams(searchParams);
  await prefetchAsync(trpc.ranking.pp.list.get.queryOptions({ cursor: page - 1, mode }));
  await prefetchAsync(trpc.ranking.pp.list.getPageCount.queryOptions({ mode }));

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl space-y-3 px-4 lg:px-8">
        <H1 className="flex flex-wrap items-center gap-x-2">
          <span>YTyping 実力ランキング</span>
          <div>
            <PPRankingInfoTrigger />
            <Link href="/manual/pp-calclate" className="ml-2 text-primary-light text-xs hover:underline">
              PP算出方法
            </Link>
          </div>
        </H1>

        <PPRanking />
      </div>
    </HydrateClient>
  );
}
