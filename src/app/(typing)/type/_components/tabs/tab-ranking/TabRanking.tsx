import ClearRateText from "@/components/shared/text/ClearRateText";
import DateDistanceText from "@/components/shared/text/DateDistanceText";
import ResultToolTipText from "@/components/shared/text/ResultToolTipText";
import { UserInputModeText } from "@/components/shared/text/UserInputModeText";
import { CardWithContent } from "@/components/ui/card";
import { Popover, PopoverAnchor, PopoverTrigger } from "@/components/ui/popover";
import { DataTable } from "@/components/ui/table/data-table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { useClapMutationRanking } from "@/utils/mutations/clap.mutations";
import { useMapRankingQueries } from "@/utils/queries/mapRanking.queries";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaHandsClapping } from "react-icons/fa6";
import { useGameUtilityReferenceParams } from "../../../_lib/atoms/refAtoms";
import { useSceneGroupState, useSetTypingStatusRank } from "../../../_lib/atoms/stateAtoms";
import RankingPopoverContent from "./RankingPopoverContent";

type RankingResult = RouterOutPuts["result"]["getMapRanking"][number];

const TabRanking = ({ className }: { className?: string }) => {
  const { id: mapId } = useParams<{ id: string }>();
  const { data, error, isPending } = useQuery(useMapRankingQueries().mapRanking({ mapId }));
  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const setTypingStatusRank = useSetTypingStatusRank();
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;

    const scores = data.map((result) => result.score);
    writeGameUtilRefParams({ rankingScores: scores });

    if (sceneGroup !== "Ready") return;
    setTypingStatusRank(scores.length + 1);
  }, [data, sceneGroup, setTypingStatusRank, writeGameUtilRefParams]);

  const toggleClap = useClapMutationRanking(Number(mapId));

  if (error) return <div>Error loading data</div>;

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
            <Popover open={isThisPopoverOpen} onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}>
              <PopoverTrigger asChild>
                <span className={cn("ml-1", rank === 1 && "text-perfect outline-text")}>{rank}</span>
              </PopoverTrigger>
              <PopoverAnchor />
              <RankingPopoverContent
                resultId={result.id}
                userId={result.player.id}
                resultUpdatedAt={result.updatedAt}
                name={result.player.name ?? ""}
                hasClapped={result.clap.hasClapped ?? false}
              />
            </Popover>
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
          return <ClearRateText clearRate={otherStatus.clearRate} isPerfect={isPerfect} />;
        },
      },
      {
        id: "name",
        header: () => "名前",
        size: 110,
        cell: ({ row }) => {
          const { name } = row.original.player;
          return <span className="truncate">{name}</span>;
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
          return <UserInputModeText typeCounts={typeCounts} />;
        },
      },
      {
        id: "time",
        header: () => "時間",
        size: 40,
        cell: ({ row }) => <DateDistanceText date={row.original.updatedAt} />,
      },
      {
        id: "clap",
        header: () => <FaHandsClapping size={16} />,
        size: 15,
        cell: ({ row }) => {
          const { data: session } = useSession();
          const { clap } = row.original;
          const hasClapped = clap.hasClapped && session ? true : false;

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
  }, [data, openPopoverIndex, toggleClap.isPending]);

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
            "border-accent-foreground  cursor-pointer text-3xl font-bold md:text-base",
            Number(session?.user.id) === data?.[index]?.player.id && "my-result text-secondary",
            openPopoverIndex === index && "bg-accent/50",
          )
        }
        tbodyId="ranking-tbody"
        rowWrapper={({ row, index, children }) => {
          const { otherStatus, typeCounts, typeSpeed } = row;
          const { kanaType, flickType } = typeCounts;
          const totalType = Object.values(typeCounts).reduce((acc, curr) => acc + curr, 0);
          const isPerfect = otherStatus.miss === 0 && otherStatus.lost === 0;
          const isKanaFlickTyped = kanaType > 0 || flickType > 0;
          const missRate = ((totalType / (otherStatus.miss + totalType)) * 100).toFixed(1);

          return (
            <TooltipWrapper
              label={
                <ResultToolTipText
                  typeCounts={typeCounts}
                  otherStatus={otherStatus}
                  missRate={missRate}
                  typeSpeed={typeSpeed}
                  isPerfect={isPerfect}
                  isKanaFlickTyped={isKanaFlickTyped}
                  updatedAt={row.updatedAt}
                />
              }
              side="bottom"
              align="end"
              delayDuration={0}
              disabled={openPopoverIndex !== null && openPopoverIndex !== index}
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

export default TabRanking;
