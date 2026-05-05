"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTRPC } from "@/app/_layout/trpc/provider";
import { Large, Small } from "@/components/ui/typography";

export const ResultSummary = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data: stats, isPending } = useQuery(
    trpc.user.stats.getRankingSummary.queryOptions({ userId: Number(userId) }),
  );

  if (isPending) {
    return (
      <section className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryItem label="登録済み譜面数" loading />
        <SummaryItem label="1位譜面数" loading />
        <SummaryItem label="1位譜面率" loading />
      </section>
    );
  }

  const totalResultCount = stats?.totalResultCount ?? 0;
  const firstRankCount = stats?.firstRankCount ?? 0;
  const rate = totalResultCount > 0 ? Math.round((firstRankCount / totalResultCount) * 1000) / 10 : 0; // 0.1% precision

  return (
    <section className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryItem label="登録済み譜面数" value={totalResultCount.toLocaleString()} />
      <SummaryItem label="1位譜面数" value={firstRankCount.toLocaleString()} />
      <SummaryItem label="1位譜面率" value={`${rate.toFixed(1)}%`} />
    </section>
  );
};

const SummaryItem = ({ label, value, loading }: { label: string; value?: string; loading?: boolean }) => {
  return (
    <div className="relative rounded-sm border p-3">
      <Small className="text-muted-foreground">{label}</Small>
      {loading && <Loader2 className="size-7 animate-spin" />}
      {value && <Large>{value}</Large>}
    </div>
  );
};
