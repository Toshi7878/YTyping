"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { InfiniteScrollSpinner } from "@/lib/infinite-scroll";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { cn } from "@/utils/cn";

type PpRow = RouterOutputs["user"]["stats"]["getPPRanking"]["items"][number];

/** 列を揃える共通グリド（見出し行＋各カード行で同一） */
const rowGrid =
  "grid grid-cols-[minmax(0,3.5rem)_minmax(0,1fr)_minmax(0,5rem)] items-center gap-2 sm:grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_minmax(0,6rem)] sm:gap-4";

export const PPRankingTable = () => {
  const trpc = useTRPC();
  const { data, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    trpc.user.stats.getPPRanking.infiniteQueryOptions({}, { getNextPageParam: (last) => last.nextCursor ?? undefined }),
  );

  const rows: PpRow[] = useMemo(() => (data?.pages ? data.pages.flatMap((p) => p.items) : []), [data?.pages]);

  return (
    <div className="space-y-2">
      <div className={cn("border-border/30 border-b pb-2 text-muted-foreground text-sm", rowGrid)}>
        <div>順位</div>
        <div>プレイヤー</div>
        <div className="text-right sm:text-left">合計 PP</div>
      </div>

      <ul className="space-y-2.5" aria-label="PP ランキング">
        {rows.map((row) => (
          <li
            key={`${row.userId}`}
            className={cn(
              "rounded-lg bg-muted/30 py-2.5 pr-3 pl-2.5 transition-colors sm:px-4",
              "hover:border-border hover:bg-muted/50",
            )}
          >
            <div className={rowGrid}>
              <div className="pl-0.5">
                <span className={cn("tabular-nums", row.rank === 1 && "text-perfect outline-text")}>#{row.rank}</span>
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 max-w-full items-center gap-2">
                  <Link
                    href={`/user/${row.userId}`}
                    className="wrap-break-word min-w-0 font-medium text-secondary hover:underline sm:truncate"
                  >
                    {row.name ?? "—"}
                  </Link>
                </div>
              </div>
              <div>
                <span className="font-semibold text-foreground tabular-nums">
                  {row.totalPP.toLocaleString("ja-JP")}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <InfiniteScrollSpinner rootMarginY="1000px" fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} />
    </div>
  );
};
