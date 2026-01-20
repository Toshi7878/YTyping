"use client";

import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { ResultCard } from "@/components/shared/result-card/card";
import { Large, Small } from "@/components/ui/typography";
import { useTRPC } from "@/trpc/provider";

export const UserResultList = ({ id }: { id: string }) => {
  const trpc = useTRPC();

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.result.list.get.infiniteQueryOptions(
      { playerId: Number(id) },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

  return (
    <div className="space-y-4">
      <StatsList userId={id} />
      <section className="grid grid-cols-1 gap-3">
        {data.pages.map((page, pageIndex) =>
          page.items.map((result) => (
            <ResultCard key={result.id} result={result} initialInView={data.pages.length - 1 === pageIndex} />
          )),
        )}
        <InfiniteScrollSpinner inViewPreset="resultListWithMap" {...pagination} />
      </section>
    </div>
  );
};

const StatsList = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data: stats, isPending } = useQuery(
    trpc.user.stats.getRankingSummary.queryOptions({ userId: Number(userId) }),
  );

  if (isPending) {
    return (
      <section className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatsItem label="登録済み譜面数" loading />
        <StatsItem label="1位譜面数" loading />
        <StatsItem label="1位譜面率" loading />
      </section>
    );
  }

  const totalResultCount = stats?.totalResultCount ?? 0;
  const firstRankCount = stats?.firstRankCount ?? 0;
  const rate = totalResultCount > 0 ? Math.round((firstRankCount / totalResultCount) * 1000) / 10 : 0; // 0.1% precision

  return (
    <section className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatsItem label="登録済み譜面数" value={totalResultCount.toLocaleString()} />
      <StatsItem label="1位譜面数" value={firstRankCount.toLocaleString()} />
      <StatsItem label="1位譜面率" value={`${rate.toFixed(1)}%`} />
    </section>
  );
};

const StatsItem = ({ label, value, loading }: { label: string; value?: string; loading?: boolean }) => {
  return (
    <div className="relative rounded-sm border p-3">
      <Small className="text-muted-foreground">{label}</Small>
      {loading && <Loader2 className="size-7 animate-spin" />}
      {value && <Large>{value}</Large>}
    </div>
  );
};
