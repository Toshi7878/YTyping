"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { Large, Small } from "@/ui/typography";

export const ResultSummary = ({ userId }: { userId: string }) => {
  const t = useTranslations("user.resultSummary");
  const { data: stats, isPending } = useQuery(
    orpc.user.stats.getRankingSummary.queryOptions({ input: { userId: Number(userId) } }),
  );

  if (isPending) {
    return (
      <section className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryItem label={t("registered")} loading />
        <SummaryItem label={t("firstCount")} loading />
        <SummaryItem label={t("firstRate")} loading />
      </section>
    );
  }

  const totalResultCount = stats?.totalResultCount ?? 0;
  const firstRankCount = stats?.firstRankCount ?? 0;
  const rate = totalResultCount > 0 ? Math.round((firstRankCount / totalResultCount) * 1000) / 10 : 0; // 0.1% precision

  return (
    <section className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryItem label={t("registered")} value={totalResultCount.toLocaleString()} />
      <SummaryItem label={t("firstCount")} value={firstRankCount.toLocaleString()} />
      <SummaryItem label={t("firstRate")} value={`${rate.toFixed(1)}%`} />
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
