"use client";

import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { RANKING_COLUMN_WIDTH } from "@/app/(typing)/type/_lib/const";
import ClapedText from "@/components/share-components/text/ClapedText";
import ClearRateText from "@/components/share-components/text/ClearRateText";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import RankText from "@/components/share-components/text/RankText";
import ResultToolTipText from "@/components/share-components/text/ResultToolTipText";
import { UserInputModeText } from "@/components/share-components/text/UserInputModeText";
import { TableCell, TableRow } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLocalClapServerActions } from "@/utils/global-hooks/useLocalClapServerActions";
import { useSession } from "next-auth/react";
import { Dispatch, useEffect } from "react";
import RankingMenu from "./RankingMenu";

interface RankingTrProps {
  result: RouterOutPuts["ranking"]["getMapRanking"][number];
  index: number;
  rank: number;
  type: number;
  romaType: number;
  kanaType: number;
  flickType: number;
  isHighlighted: boolean;
  showMenu: number | null;
  setShowMenu: Dispatch<number | null>;
  setHoveredIndex: Dispatch<number | null>;
  isHovered: boolean;
  handleShowMenu: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const RankingTr = (props: RankingTrProps) => {
  const { result } = props;
  const { status } = result as { status: NonNullable<typeof result.status> };
  const { data: session } = useSession();
  const userId = Number(session?.user.id);
  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();

  const { clapOptimisticState, toggleClapAction } = useLocalClapServerActions({
    hasClap: !!result.claps[0]?.is_claped && !!session,
    clapCount: result.clap_count,
  });

  useEffect(() => {
    if (userId === result.user_id) {
      writeGameUtilRefParams({
        practiceMyResultId: result.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPerfect = status.miss === 0 && status.lost === 0;
  const isKanaFlickTyped = props.kanaType > 0 || props.flickType > 0;
  const correctRate = ((props.type / (status.miss + props.type)) * 100).toFixed(1);

  return (
    <>
      <TableRow
        className={`cursor-pointer transition-colors ${userId === result.user_id ? "my-result text-green-500" : ""} ${
          props.isHighlighted ? "bg-white/20" : ""
        } hover:bg-white/20`}
        style={{
          zIndex: 5,
        }}
        onClick={props.handleShowMenu}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      >
        <TableCell style={{ width: RANKING_COLUMN_WIDTH.rank }}>
          <RankText rank={props.rank}>{`#${props.rank}`}</RankText>
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
            kanaType={props.kanaType}
            romaType={props.romaType}
            flickType={props.flickType}
            englishType={result.status!.english_type}
            symbolType={result.status!.symbol_type}
            numType={result.status!.num_type}
            spaceType={result.status!.space_type}
          />
        </TableCell>
        <TableCell style={{ width: RANKING_COLUMN_WIDTH.updatedAt }}>
          <DateDistanceText date={new Date(result.updated_at)} />
        </TableCell>
        <TableCell style={{ width: RANKING_COLUMN_WIDTH.clapCount }} className="text-center">
          <ClapedText clapOptimisticState={clapOptimisticState} />
        </TableCell>
        <TableCell
          style={{
            width: 0,
            padding: 0,
            border: "none",
            overflow: "hidden",
          }}
        >
          <TooltipWrapper
            label={
              <ResultToolTipText
                romaType={props.romaType}
                kanaType={props.kanaType}
                flickType={props.flickType}
                englishType={result.status!.english_type}
                numType={result.status!.num_type}
                symbolType={result.status!.symbol_type}
                spaceType={result.status!.space_type}
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
            open={(props.isHighlighted && window.innerWidth >= 768) || props.isHovered}
            side="bottom"
            delayDuration={0}
          >
            <span style={{ display: "block", width: 0, height: 0 }} />
          </TooltipWrapper>
        </TableCell>
      </TableRow>
      {props.showMenu === props.index && (
        <RankingMenu
          resultId={result.id}
          userId={result.user_id}
          resultUpdatedAt={result.updated_at}
          name={result.user.name as string}
          setShowMenu={props.setShowMenu}
          setHoveredIndex={props.setHoveredIndex}
          clapOptimisticState={clapOptimisticState}
          toggleClapAction={toggleClapAction}
        />
      )}
    </>
  );
};

export default RankingTr;
