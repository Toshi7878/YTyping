import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { FaHandsClapping } from "react-icons/fa6";
import { ClearRateText } from "@/components/shared/text/clear-rate-text";
import { DateDistanceText } from "@/components/shared/text/date-distance-text";
import { InputModeText } from "@/components/shared/text/input-mode-text";
import { ResultToolTipText } from "@/components/shared/text/result-tooltip-text";
import { CardWithContent } from "@/components/ui/card";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { DataTable } from "@/components/ui/table/data-table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useClapMutationRanking } from "@/lib/mutations/clap.mutations";
import { useMapRankingQueries } from "@/lib/queries/map-ranking.queries";
import { cn } from "@/lib/utils";
import type { RouterOutPuts } from "@/server/api/trpc";
import { writeUtilityRefParams } from "../../../_lib/atoms/read-atoms";
import { setRankStatus, useSceneGroupState } from "../../../_lib/atoms/state-atoms";
import { RankingPopoverContent } from "./ranking-popover-menu";

type RankingResult = RouterOutPuts["result"]["getMapRanking"][number];

export const RankingTableCard = ({ className }: { className?: string }) => {
  const { id: mapId } = useParams<{ id: string }>();
  const { data, error, isPending } = useQuery(useMapRankingQueries().mapRanking({ mapId }));
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;

    const scores = data.map((result) => result.score);
    writeUtilityRefParams({ rankingScores: scores });

    if (sceneGroup !== "Ready") return;
    setRankStatus(scores.length + 1);
  }, [data, sceneGroup]);

  const toggleClap = useClapMutationRanking(Number(mapId));

  const columns: ColumnDef<RankingResult, unknown>[] = useMemo(() => {
    return [
      {
        id: "rank",
        header: () => "順位",
        size: 10,

        cell: ({ row }) => {
          const { original: result, index } = row;
          const rank = index + 1;
          const isThisPopoverOpen = openPopoverIndex === index;

          return (
            <>
              <span className={cn("ml-1 pointer-events-none", rank === 1 && "text-perfect outline-text")}>#{rank}</span>
              <Popover open={isThisPopoverOpen} onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}>
                <PopoverAnchor />
                <RankingPopoverContent
                  resultId={result.id}
                  userId={result.player.id}
                  resultUpdatedAt={result.updatedAt}
                  name={result.player.name ?? ""}
                  hasClapped={result.clap.hasClapped ?? false}
                />
              </Popover>
            </>
          );
        },
      },
      {
        id: "score",
        header: () => "Score",
        size: 35,
        cell: ({ row }) => row.original.score,
      },
      {
        id: "clearRate",
        header: () => "クリア率",
        size: 40,
        cell: ({ row }) => {
          const { otherStatus } = row.original;
          const isPerfect = otherStatus.miss === 0 && otherStatus.lost === 0;
          return (
            <ClearRateText clearRate={otherStatus.clearRate} isPerfect={isPerfect} className="pointer-events-none" />
          );
        },
      },
      {
        id: "name",
        header: () => "名前",
        size: 110,
        cell: ({ row }) => {
          const { name } = row.original.player;
          return <span className="truncate pointer-events-none">{name}</span>;
        },
      },
      {
        id: "kpm",
        header: () => "kpm",
        size: 30,
        cell: ({ row }) => row.original.typeSpeed.kpm,
      },
      {
        id: "mode",
        header: () => "モード",
        size: 60,
        cell: ({ row }) => {
          const { typeCounts } = row.original;
          return <InputModeText typeCounts={typeCounts} />;
        },
      },
      {
        id: "time",
        header: () => "時間",
        size: 40,
        cell: ({ row }) => <DateDistanceText date={row.original.updatedAt} className="pointer-events-none" />,
      },
      {
        id: "clap",
        header: () => <FaHandsClapping size={16} className="size-10 md:size-4" />,
        size: 15,
        cell: ({ row }) => {
          const { clap } = row.original;
          const hasClapped = !!(clap.hasClapped && session);

          return (
            <div className="ml-1" title={clap.hasClapped ? "拍手を取り消す" : "拍手する"}>
              <span className={cn(hasClapped && "outline-text text-yellow-500")}>{clap.count}</span>
            </div>
          );
        },
        meta: {
          cellClassName: (cell) => {
            return cn(
              toggleClap.isPending ? "opacity-80" : "",
              cell.row.original.clap.hasClapped ? "" : "hover:bg-perfect/20",
            );
          },
          onClick: (event, row) => {
            if (!session?.user?.id || toggleClap.isPending) return;
            event.preventDefault();
            event.stopPropagation();
            toggleClap.mutate({ resultId: row.id, newState: !row.clap.hasClapped });
          },
        },
      },
    ];
  }, [data, openPopoverIndex, toggleClap.isPending, session?.user?.id, toggleClap.mutate]);

  if (error) return <div>Error loading data</div>;

  return (
    <CardWithContent
      id="tab-ranking-card"
      className={{
        card: cn("tab-card overflow-y-scroll py-0", className),
      }}
    >
      <DataTable<RankingResult, unknown>
        loading={isPending}
        columns={columns}
        data={data ?? []}
        onRowClick={(_, __, index) => {
          setOpenPopoverIndex((prev) => (prev === index ? null : index));
        }}
        className={cn("ranking-table overflow-visible rounded-none border-0")}
        rowClassName={(index) =>
          cn(
            "border-accent-foreground cursor-pointer text-4xl font-bold md:text-base h-20 md:h-auto",
            Number(session?.user.id) === data?.[index]?.player.id && "my-result text-secondary",
            openPopoverIndex === index && "bg-accent/50",
          )
        }
        headerRowClassName="text-3xl font-bold md:text-base h-20 md:h-auto"
        tbodyId="ranking-tbody"
        rowWrapper={({ row, index, children }) => {
          const { otherStatus, typeCounts, typeSpeed } = row;
          const { kanaType, flickType } = typeCounts;
          const totalType = Object.values(typeCounts).reduce((acc, curr) => acc + curr, 0);
          const isKanaFlickTyped = kanaType > 0 || flickType > 0;
          const missRate = ((totalType / (otherStatus.miss + totalType)) * 100).toFixed(1);

          return (
            <TooltipWrapper
              toolTipTriggerProps={{
                onPointerDown: (event) => event.preventDefault(),
              }}
              label={
                <ResultToolTipText
                  typeCounts={typeCounts}
                  otherStatus={otherStatus}
                  missRate={missRate}
                  typeSpeed={typeSpeed}
                  isKanaFlickTyped={isKanaFlickTyped}
                  updatedAt={row.updatedAt}
                />
              }
              side="bottom"
              align="end"
              sideOffset={-12}
              delayDuration={0}
              onPointerDownOutside={(event) => event.preventDefault()}
              open={openPopoverIndex === null ? undefined : openPopoverIndex === index}
            >
              {children}
            </TooltipWrapper>
          );
        }}
      />
    </CardWithContent>
  );
};
