import ClapedText from "@/components/shared/text/ClapedText";
import ClearRateText from "@/components/shared/text/ClearRateText";
import DateDistanceText from "@/components/shared/text/DateDistanceText";
import RankText from "@/components/shared/text/RankText";
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

type RankingResult = RouterOutPuts["ranking"]["getMapRanking"][number];

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

    const scores = data.map((result) => result.status.score);
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

          const { data: session } = useSession();
          const hasClap = !!result.claps[0]?.is_claped && !!session;

          return (
            <Popover open={isThisPopoverOpen} onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}>
              <PopoverTrigger asChild>
                <RankText rank={rank}>#{rank}</RankText>
              </PopoverTrigger>
              <PopoverAnchor />
              <RankingPopoverContent
                resultId={result.id}
                userId={result.user_id}
                resultUpdatedAt={result.updated_at}
                name={result.user.name ?? ""}
                clapOptimisticState={{ hasClap, clapCount: result.clap_count }}
              />
            </Popover>
          );
        },
      },
      {
        id: "score",
        header: () => "Score",
        size: 35,
        cell: ({ row }) => row.original.status.score,
      },
      {
        id: "clearRate",
        header: () => "クリア率",
        size: 40,
        cell: ({ row }) => {
          const { status } = row.original;
          const isPerfect = status.miss === 0 && status.lost === 0;
          return <ClearRateText clearRate={status.clear_rate} isPerfect={isPerfect} />;
        },
      },
      {
        id: "name",
        header: () => "名前",
        size: 110,
        cell: ({ row }) => {
          const { name } = row.original.user;
          return <span className="truncate">{name}</span>;
        },
      },
      {
        id: "kpm",
        header: () => "kpm",
        size: 30,
        cell: ({ row }) => row.original.status.kpm,
      },
      {
        id: "mode",
        header: () => "モード",
        size: 60,
        cell: ({ row }) => {
          const { status } = row.original;

          return (
            <UserInputModeText
              kanaType={status.kana_type}
              romaType={status.roma_type}
              flickType={status.flick_type}
              englishType={status.english_type}
              symbolType={status.symbol_type}
              numType={status.num_type}
              spaceType={status.space_type}
            />
          );
        },
      },
      {
        id: "time",
        header: () => "時間",
        size: 40,
        cell: ({ row }) => <DateDistanceText date={row.original.updated_at} />,
      },
      {
        id: "clap",
        header: () => <FaHandsClapping size={16} />,
        size: 15,
        cell: ({ row }) => {
          const hasClap = !!row.original.claps[0]?.is_claped && !!session;
          return (
            <div className="ml-1" title={hasClap ? "拍手を取り消す" : "拍手する"}>
              <ClapedText clapOptimisticState={{ hasClap, clapCount: row.original.clap_count }} />
            </div>
          );
        },
        meta: {
          cellClassName: (cell) => {
            const hasClap = !!cell.row.original.claps[0]?.is_claped && !!session;
            return cn(toggleClap.isPending ? "opacity-80" : "", hasClap ? "" : "hover:bg-perfect/20");
          },
          onClick: (event, row) => {
            if (!session?.user?.id || toggleClap.isPending) return;
            event.preventDefault();
            event.stopPropagation();
            toggleClap.mutate({ resultId: row.id, optimisticState: !row.claps[0]?.is_claped });
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
            Number(session?.user.id) === data?.[index]?.user_id && "my-result text-secondary",
            openPopoverIndex === index && "bg-accent/50",
          )
        }
        tbodyId="ranking-tbody"
        rowWrapper={({ row, index, children }) => {
          const { status } = row;
          const { roma_type, kana_type, flick_type, english_type, num_type, symbol_type, space_type } = status;
          const totalType = roma_type + kana_type + flick_type + english_type + num_type + symbol_type + space_type;
          const isPerfect = status.miss === 0 && status.lost === 0;
          const isKanaFlickTyped = kana_type > 0 || flick_type > 0;
          const correctRate = ((totalType / (status.miss + totalType)) * 100).toFixed(1);

          return (
            <TooltipWrapper
              label={
                <ResultToolTipText
                  romaType={roma_type}
                  kanaType={kana_type}
                  flickType={flick_type}
                  englishType={status.english_type}
                  numType={status.num_type}
                  symbolType={status.symbol_type}
                  spaceType={status.space_type}
                  correctRate={correctRate}
                  isPerfect={isPerfect}
                  isKanaFlickTyped={isKanaFlickTyped}
                  lost={status.lost}
                  miss={status.miss}
                  maxCombo={status.max_combo}
                  kpm={status.kpm}
                  rkpm={status.rkpm}
                  romaKpm={status.roma_kpm}
                  romaRkpm={status.roma_rkpm}
                  defaultSpeed={status.default_speed}
                  updatedAt={row.updated_at}
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
