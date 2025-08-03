"use client";

import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { RANKING_COLUMN_WIDTH } from "@/app/(typing)/type/_lib/const";
import ClapedText from "@/components/share-components/text/ClapedText";
import ClearRateText from "@/components/share-components/text/ClearRateText";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import RankText from "@/components/share-components/text/RankText";
import { UserInputModeText } from "@/components/share-components/text/UserInputModeText";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { LocalClapState } from "@/types";
import { useSession } from "next-auth/react";
import { forwardRef, useEffect } from "react";

interface RankingTrProps {
  result: RouterOutPuts["ranking"]["getMapRanking"][number];
  rank: number;
  clapOptimisticState: LocalClapState;
  isHighlighted?: boolean;
}

const RankingTr = forwardRef<HTMLTableRowElement, RankingTrProps>(
  ({ result, rank, clapOptimisticState, isHighlighted = false, ...props }, ref) => {
    const { status } = result as { status: NonNullable<typeof result.status> };
    const { data: session } = useSession();
    const userId = Number(session?.user.id);
    const { writeGameUtilRefParams } = useGameUtilityReferenceParams();

    useEffect(() => {
      if (userId === result.user_id) {
        writeGameUtilRefParams({
          practiceMyResultId: result.id,
        });
      }
    }, []);

    if (!result.status) return null;

    const isPerfect = status.miss === 0 && status.lost === 0;

    return (
      <TableRow
        ref={ref}
        className={cn(
          "border-foreground cursor-pointer text-base font-bold",
          userId === result.user_id && "my-result text-secondary",
          isHighlighted && "bg-muted/50",
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
  },
);

RankingTr.displayName = "RankingTr";

export default RankingTr;
