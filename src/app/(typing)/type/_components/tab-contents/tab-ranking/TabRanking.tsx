import ResultToolTipText from "@/components/share-components/text/ResultToolTipText";
import { CardWithContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLocalClapServerActions } from "@/utils/global-hooks/useLocalClapServerActions";
import { useMapRankingQueries } from "@/utils/queries/mapRanking.queries";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHandsClapping } from "react-icons/fa6";
import { useGameUtilityReferenceParams } from "../../../_lib/atoms/refAtoms";
import { useSceneState, useSetTypingStatusRank } from "../../../_lib/atoms/stateAtoms";
import { RANKING_COLUMN_WIDTH } from "../../../_lib/const";
import RankingMenu from "./RankingPopoverContent";
import RankingTr from "./RankingTr";

const TabRanking = ({ className }: { className: string }) => {
  return (
    <CardWithContent
      className={{
        card: cn("tab-card overflow-y-scroll py-0", className),
      }}
    >
      <RankingList />
    </CardWithContent>
  );
};
const RankingList = () => {
  const { data: session } = useSession();
  const scene = useSceneState();
  const { id: mapId } = useParams<{ id: string }>();
  const { data, error, isPending } = useQuery(useMapRankingQueries().mapRanking({ mapId }));
  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const setTypingStatusRank = useSetTypingStatusRank();
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const scores = data
      ? data.map((result: (typeof data)[number]) => result.status?.score).filter((score) => score !== undefined)
      : [];

    writeGameUtilRefParams({
      rankingScores: scores,
    });

    setTypingStatusRank(scores.length + 1);
  }, [data]);

  useEffect(() => {
    const userId = Number(session?.user?.id);

    if (scene === "play" && data) {
      for (let i = 0; i < data.length; i++) {
        if (userId === Number(data[i].user_id)) {
          writeGameUtilRefParams({
            myBestScore: data[i].status!.score,
          });
        }
      }
    }
  }, [scene, data]);

  if (isPending) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (error) return <div>Error loading data</div>;

  return (
    <Table className="ranking-table text-sm">
      <TableHeader className="select-none">
        <TableRow className="hover:bg-transparent">
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.rank }}>順位</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.score }}>Score</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.clearRate }}>クリア率</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.userName }}>名前</TableHead>

          <TableHead style={{ width: RANKING_COLUMN_WIDTH.kpm }}>kpm</TableHead>
          <TableHead style={{ maxWidth: RANKING_COLUMN_WIDTH.inputMode }}>モード</TableHead>
          <TableHead style={{ width: RANKING_COLUMN_WIDTH.updatedAt }}>時間</TableHead>
          <TableHead
            className="relative"
            style={{
              width: RANKING_COLUMN_WIDTH.clapCount,
            }}
          >
            <FaHandsClapping size={16} />
          </TableHead>
          <TableHead className="w-0 border-none p-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((result: (typeof data)[number], index: number) => {
          return (
            <RankingRow
              key={result.id}
              result={result}
              index={index}
              openPopoverIndex={openPopoverIndex}
              setOpenPopoverIndex={setOpenPopoverIndex}
            />
          );
        })}
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

  if (!result.status) return null;
  const { status } = result;

  const { roma_type, kana_type, flick_type, english_type, num_type, symbol_type, space_type } = status;
  const totalType = roma_type + kana_type + flick_type + english_type + num_type + symbol_type + space_type;
  const isPerfect = status.miss === 0 && status.lost === 0;
  const isKanaFlickTyped = kana_type > 0 || flick_type > 0;
  const correctRate = ((totalType / (status.miss + totalType)) * 100).toFixed(1);

  const isThisPopoverOpen = openPopoverIndex === index;
  const isAnyPopoverOpen = openPopoverIndex !== null;

  const handleOpenChange = (open: boolean) => {
    setOpenPopoverIndex(open ? index : null);
  };

  return (
    <Popover key={result.id} open={isThisPopoverOpen} onOpenChange={handleOpenChange}>
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
      <RankingMenu
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
export default TabRanking;
