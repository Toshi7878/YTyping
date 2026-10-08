"use client";

import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { PP_MODE_DESCRIPTIONS, PP_MODE_LABELS, PP_MODES, type PpMode } from "@/shared/result/pp/mode";
import { PageNavigation } from "@/ui/page-navigation";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { cn } from "@/utils/cn";
import { usePpRankingQueryStates } from "./search-params";

type PpRow = RouterOutputs["ranking"]["pp"]["list"]["get"]["items"][number];

const rowGrid =
  "grid grid-cols-[minmax(0,3.5rem)_minmax(0,1fr)_minmax(0,5rem)] items-center gap-2 sm:grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_minmax(0,6rem)] sm:gap-4";

const MODE_TAB_COLORS: Partial<Record<PpMode, string>> = {
  roma: "data-active:bg-roma not-data-active:hover:bg-roma/30",
  kana: "data-active:bg-kana not-data-active:hover:bg-kana/30",
  flick: "data-active:bg-flick not-data-active:hover:bg-flick/30",
  english: "data-active:bg-english not-data-active:hover:bg-english/30",
};

export const PPRanking = () => {
  const [{ page, mode }, setQuery] = usePpRankingQueryStates();

  const { data, isPlaceholderData } = useQuery(
    orpc.ranking.pp.list.get.queryOptions({ input: { cursor: page - 1, mode }, placeholderData: keepPreviousData }),
  );
  const { data: pageCount } = useSuspenseQuery(orpc.ranking.pp.list.getPageCount.queryOptions({ input: { mode } }));

  const rows: PpRow[] = data?.items ?? [];

  return (
    <div className="space-y-2">
      <Tabs value={mode} onValueChange={(value) => setQuery({ mode: value as PpMode, page: 1 })}>
        <TabsList className="flex h-fit w-full flex-wrap gap-1">
          {PP_MODES.map((m) => (
            <TabsTrigger key={m} value={m} className={cn("data-active:text-foreground", MODE_TAB_COLORS[m])}>
              {PP_MODE_LABELS[m]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {PP_MODE_DESCRIPTIONS[mode] && <p className="text-muted-foreground text-sm">{PP_MODE_DESCRIPTIONS[mode]}</p>}

      <PageNavigation page={page} pageCount={pageCount} onPageChange={(p) => setQuery({ page: p })} size="sm" />
      <div className={cn("border-border/30 border-b pb-2 text-muted-foreground text-sm", rowGrid)}>
        <div>順位</div>
        <div>プレイヤー</div>
        <div className="text-right sm:text-left">合計 PP</div>
      </div>

      <ul className={cn("space-y-2", isPlaceholderData && "opacity-50")} aria-label="PP ランキング">
        {rows.map((row) => (
          <li
            key={`${row.userId}`}
            className={cn(
              "rounded-lg bg-muted/30 py-2 pr-3 pl-2.5 transition-colors sm:px-4",
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
                <span className="font-semibold text-foreground tabular-nums">{row.pp.toLocaleString("ja-JP")}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <PageNavigation page={page} pageCount={pageCount} onPageChange={(p) => setQuery({ page: p })} size="sm" />
    </div>
  );
};
