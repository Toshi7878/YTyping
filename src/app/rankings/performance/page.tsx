import type { Metadata } from "next";
import Link from "next/link";
import { H1 } from "@/components/ui/typography";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { PPRankingInfoTrigger } from "./_components/pp-ranking-info-trigger";
import { PPRankingTable } from "./_components/pp-ranking-table";

export const metadata: Metadata = {
  title: "PP ランキング | YTyping",
  description: "全譜面の合計 Performance Points によるランキング",
};

export default async function Page() {
  prefetch(
    trpc.user.stats.getPPRanking.infiniteQueryOptions({}, { getNextPageParam: (last) => last.nextCursor ?? undefined }),
  );

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl space-y-4 px-4 lg:px-8">
        <H1 className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>YTyping 実力ランキング</span>
          <div>
            <PPRankingInfoTrigger />
            <Link href="/manual/pp-calclate" className="ml-2 text-primary-light text-xs hover:underline">
              PP算出方法
            </Link>
          </div>
        </H1>

        <PPRankingTable />
      </div>
    </HydrateClient>
  );
}
