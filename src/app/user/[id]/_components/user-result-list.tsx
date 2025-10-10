"use client";

import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ResultCard } from "@/components/shared/result-card/card";
import { Spinner } from "@/components/ui/spinner";
import { Large, Small } from "@/components/ui/typography";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/use-infinite-scroll";

export const UserResultList = ({ id }: { id: string }) => {
  const trpc = useTRPC();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    trpc.result.getAllWithMapByUserId.infiniteQueryOptions(
      { playerId: Number(id) },
      { getNextPageParam: (lastPage) => lastPage.nextCursor, refetchOnWindowFocus: false, gcTime: Infinity },
    ),
  );

  const ref = useInfiniteScroll(
    { isFetchingNextPage, fetchNextPage, hasNextPage },
    { threshold: 0, rootMargin: "2000px 0px" },
  );

  return (
    <div className="space-y-4">
      <StatsList userId={id} />
      <section className="grid grid-cols-1 gap-3">
        {data.pages.map((page) => page.items.map((result) => <ResultCard key={result.id} result={result} />))}
        {hasNextPage && <Spinner ref={ref} />}
      </section>
    </div>
  );
};

const StatsList = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data: stats, isPending } = useQuery(trpc.result.getUserResultStats.queryOptions({ userId: Number(userId) }));

  if (isPending) {
    return (
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-1">
        <StatsItem label="登録済み譜面数" loading />
        <StatsItem label="1位譜面数" loading />
        <StatsItem label="1位譜面率" loading />
      </section>
    );
  }

  const total = stats?.totalResults ?? 0;
  const first = stats?.firstRankCount ?? 0;
  const rate = total > 0 ? Math.round((first / total) * 1000) / 10 : 0; // 0.1% precision

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-1">
      <StatsItem label="登録済み譜面数" value={total.toLocaleString()} />
      <StatsItem label="1位譜面数" value={first.toLocaleString()} />
      <StatsItem label="1位譜面率" value={`${rate.toFixed(1)}%`} />
    </section>
  );
};

const StatsItem = ({ label, value, loading }: { label: string; value?: string; loading?: boolean }) => {
  return (
    <div className="rounded-sm border p-3 relative">
      <Small className="text-muted-foreground">{label}</Small>
      {loading && <Loader2 className="animate-spin size-7" />}
      {value && <Large>{value}</Large>}
    </div>
  );
};
