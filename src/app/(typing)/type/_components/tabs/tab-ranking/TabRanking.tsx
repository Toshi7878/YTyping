import ClapedText from "@/components/shared/text/ClapedText";
import ClearRateText from "@/components/shared/text/ClearRateText";
import DateDistanceText from "@/components/shared/text/DateDistanceText";
import RankText from "@/components/shared/text/RankText";
import ResultToolTipText from "@/components/shared/text/ResultToolTipText";
import { UserInputModeText } from "@/components/shared/text/UserInputModeText";
import { CardWithContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { LocalClapState } from "@/types";
import { useLocalClapServerActions } from "@/utils/hooks/useLocalClapServerActions";
import { useMapRankingQueries } from "@/utils/queries/mapRanking.queries";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHandsClapping } from "react-icons/fa6";
import { useGameUtilityReferenceParams } from "../../../_lib/atoms/refAtoms";
import { useSetTypingStatusRank } from "../../../_lib/atoms/stateAtoms";
import { RANKING_COLUMN_WIDTH } from "../../../_lib/const";
import RankingPopoverContent from "./RankingPopoverContent";

const TabRanking = ({ className }: { className: string }) => {
  return (
    <CardWithContent
      id="tab-ranking-card"
      className={{
        card: cn("tab-card overflow-y-scroll py-0", className),
      }}
    >
      <RankingList />
    </CardWithContent>
  );
};

const RankingList = () => {
  const { id: mapId } = useParams<{ id: string }>();
  const { data, error, isPending } = useQuery(useMapRankingQueries().mapRanking({ mapId }));
  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const setTypingStatusRank = useSetTypingStatusRank();
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;

    const scores = data.map((result) => result.status.score);
    writeGameUtilRefParams({ rankingScores: scores });
    setTypingStatusRank(scores.length + 1);
  }, [data]);

  if (error) return <div>Error loading data</div>;

  return (
    <Table className="ranking-table">
      <TableHeader className="select-none">
        <TableRow className="hover:bg-transparent">
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.rank }}>順位</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.score }}>Score</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.clearRate }}>クリア率</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.userName }}>名前</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.kpm }}>kpm</TableHead>
          <TableHead style={{ maxWidth: RANKING_COLUMN_WIDTH.inputMode }}>モード</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.updatedAt }}>時間</TableHead>
          <TableHead className="relative" style={{ width: RANKING_COLUMN_WIDTH.clapCount }}>
            <FaHandsClapping size={16} />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending ? (
          <TableRow>
            <td colSpan={9} className="py-12 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="size-10 animate-spin" />
              </div>
            </td>
          </TableRow>
        ) : (
          data.map((result, index: number) => {
            return (
              <RankingRow
                key={result.id}
                result={result}
                index={index}
                openPopoverIndex={openPopoverIndex}
                setOpenPopoverIndex={setOpenPopoverIndex}
              />
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

interface RankingRowProps {
  result: RouterOutPuts["ranking"]["getMapRanking"][number];
  index: number;
  openPopoverIndex: number | null;
  setOpenPopoverIndex: (index: number | null) => void;
}

const RankingRow = ({ result, index, openPopoverIndex, setOpenPopoverIndex }: RankingRowProps) => {
  const { data: session } = useSession();

  const { clapOptimisticState, toggleClapAction } = useLocalClapServerActions({
    hasClap: !!result.claps[0]?.is_claped && !!session,
    clapCount: result.clap_count,
  });

  const { status } = result;

  const { roma_type, kana_type, flick_type, english_type, num_type, symbol_type, space_type } = status;
  const totalType = roma_type + kana_type + flick_type + english_type + num_type + symbol_type + space_type;
  const isPerfect = status.miss === 0 && status.lost === 0;
  const isKanaFlickTyped = kana_type > 0 || flick_type > 0;
  const correctRate = ((totalType / (status.miss + totalType)) * 100).toFixed(1);

  const isThisPopoverOpen = openPopoverIndex === index;
  const isAnyPopoverOpen = openPopoverIndex !== null;

  return (
    <Popover key={result.id} open={isThisPopoverOpen} onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}>
      <TooltipWrapper
        open={isThisPopoverOpen ? true : undefined}
        disabled={isAnyPopoverOpen && !isThisPopoverOpen}
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
            updatedAt={result.updated_at}
          />
        }
        side="bottom"
        align="end"
        delayDuration={0}
      >
        <PopoverTrigger asChild>
          <RankingTr
            result={result}
            rank={index + 1}
            clapOptimisticState={clapOptimisticState}
            isHighlighted={isThisPopoverOpen}
          />
        </PopoverTrigger>
      </TooltipWrapper>
      <RankingPopoverContent
        resultId={result.id}
        userId={result.user_id}
        resultUpdatedAt={result.updated_at}
        name={result.user.name ?? ""}
        clapOptimisticState={clapOptimisticState}
        toggleClapAction={toggleClapAction}
      />
    </Popover>
  );
};

interface RankingTrProps {
  result: RouterOutPuts["ranking"]["getMapRanking"][number];
  rank: number;
  clapOptimisticState: LocalClapState;
  isHighlighted?: boolean;
}

const RankingTr = ({ result, rank, clapOptimisticState, isHighlighted = false, ...props }: RankingTrProps) => {
  const { status } = result;
  const { data: session } = useSession();
  const userId = Number(session?.user.id);

  const isPerfect = status.miss === 0 && status.lost === 0;

  return (
    <TableRow
      className={cn(
        "border-accent-foreground cursor-pointer text-3xl font-bold md:text-base",
        userId === result.user_id && "my-result text-secondary",
        isHighlighted && "bg-accent/50",
      )}
      {...props}
    >
      <TableCell style={{ width: RANKING_COLUMN_WIDTH.rank }}>
        <RankText rank={rank}>#{rank}</RankText>
      </TableCell>
      <TableCell style={{ width: RANKING_COLUMN_WIDTH.score }}>{status.score}</TableCell>
      <TableCell style={{ width: RANKING_COLUMN_WIDTH.clearRate }}>
        <ClearRateText clearRate={status.clear_rate} isPerfect={isPerfect} />
      </TableCell>
      <TableCell
        className="truncate"
        style={{
          width: RANKING_COLUMN_WIDTH.userName,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {result.user.name}
      </TableCell>

      <TableCell style={{ width: RANKING_COLUMN_WIDTH.kpm }}>{status.kpm}</TableCell>
      <TableCell style={{ width: RANKING_COLUMN_WIDTH.inputMode }}>
        <UserInputModeText
          kanaType={status.kana_type}
          romaType={status.roma_type}
          flickType={status.flick_type}
          englishType={status.english_type}
          symbolType={status.symbol_type}
          numType={status.num_type}
          spaceType={status.space_type}
        />
      </TableCell>
      <TableCell style={{ width: RANKING_COLUMN_WIDTH.updatedAt }}>
        <DateDistanceText date={new Date(result.updated_at)} />
      </TableCell>
      <TableCell style={{ width: RANKING_COLUMN_WIDTH.clapCount }} className="text-center">
        <ClapedText clapOptimisticState={clapOptimisticState} />
      </TableCell>
    </TableRow>
  );
};

export default TabRanking;
